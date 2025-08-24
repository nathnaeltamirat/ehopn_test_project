import { Response } from 'express';
import { Invoice } from '../models/Invoice';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { IAuthRequest, IInvoiceResponse, IInvoiceUploadResponse, IApiResponse } from '../types';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');


const fallbackData: IInvoiceUploadResponse = {
  vendor: 'Unknown Vendor',
  date: new Date().toISOString().split('T')[0], 
  amount: 0.00,
  taxId: 'N/A'
};


async function extractTextFromFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
  try {

    if (mimeType === 'application/pdf') {
      console.log('Processing PDF file...');
      const data = await pdf(fileBuffer);
      return data.text;
    }
    
 
    if (mimeType.startsWith('image/')) {
      console.log('Processing image file with OCR...');
      const result = await Tesseract.recognize(
        fileBuffer,
        'eng', 
        {
          logger: m => console.log(m) 
        }
      );
      return result.data.text;
    }
    

    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      console.log('Processing Excel file...');
      return 'Excel file detected - using fallback data extraction';
    }
    
    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from ${mimeType} file`);
  }
}


async function extractInvoiceDataWithGemini(extractedText: string): Promise<IInvoiceUploadResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback data');
      return fallbackData;
    }


    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let model;
    let lastError;

    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Using Gemini model: ${modelName}`);
        break;
      } catch (error) {
        console.log(`Model ${modelName} not available, trying next...`);
        lastError = error;
      }
    }

    if (!model) {
      console.error('No available Gemini model found:', lastError);
      return fallbackData;
    }

    const prompt = `
    Extract invoice information from the following text. Return ONLY a valid JSON object with the following structure:
    {
      "vendor": "Company/Vendor name",
      "date": "YYYY-MM-DD format",
      "amount": "Total amount as number",
      "taxId": "Tax ID or VAT number"
    }

    Rules:
    - If a field cannot be found, use reasonable defaults
    - Date should be in YYYY-MM-DD format
    - Amount should be a number (no currency symbols)
    - Vendor should be the company name that issued the invoice
    - Tax ID should be any tax identification number found
    - Do NOT include any markdown formatting, code blocks, or additional text
    - Return ONLY the raw JSON object

    Text to analyze:
    ${extractedText}

    Return only the JSON object, no markdown, no code blocks, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    

    try {

      let cleanText = text.trim();

      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
 
      cleanText = cleanText.trim();
      
      console.log('Cleaned Gemini response:', cleanText);
      
      const extractedData = JSON.parse(cleanText);
      return {
        vendor: extractedData.vendor || fallbackData.vendor,
        date: extractedData.date || fallbackData.date,
        amount: extractedData.amount || fallbackData.amount,
        taxId: extractedData.taxId || fallbackData.taxId
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response text:', text);
      return fallbackData;
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return fallbackData;
  }
}


function extractInvoiceDataWithRegex(extractedText: string): IInvoiceUploadResponse {
  try {
    console.log('Using regex extraction for text:', extractedText.substring(0, 300) + '...');
    
  
    const vendorPatterns = [
      /vendor:\s*([A-Za-z0-9\s&.,'-]+)/i,
      /(?:from|vendor|company|issued by|bill from|business name):\s*([A-Za-z0-9\s&.,'-]+)/i,
      /^([A-Za-z0-9\s&.,'-]+)\s*(?:invoice|bill|receipt|statement)/i,
      /([A-Za-z0-9\s&.,'-]{3,50})\s*(?:ltd|inc|corp|company|gmbh|ag|llc|co\.|limited)/i,
      /(?:business|company|vendor):\s*([A-Za-z0-9\s&.,'-]{3,50})/i
    ];

    let vendor = fallbackData.vendor;
    for (const pattern of vendorPatterns) {
      const match = extractedText.match(pattern);
      if (match && match[1]) {
        vendor = match[1].trim();
        break;
      }
    }


    const datePatterns = [
      /invoice_date:\s*([A-Za-z]+\s+[A-Za-z]+\s+\d{1,2}\s+\d{4})/i,
      /(\d{4}-\d{2}-\d{2})/, // YYYY-MM-DD
      /(\d{2}\/\d{2}\/\d{4})/, // MM/DD/YYYY
      /(\d{2}-\d{2}-\d{4})/, // MM-DD-YYYY
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/ // Various date formats
    ];

    let date = fallbackData.date;
    for (const pattern of datePatterns) {
      const match = extractedText.match(pattern);
      if (match && match[1]) {
        const matchedDate = match[1];
        // Convert to YYYY-MM-DD format
        if (matchedDate.includes('/')) {
          const parts = matchedDate.split('/');
          if (parts.length === 3) {
            if (parts[2].length === 2) {
              parts[2] = '20' + parts[2];
            }
            date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        } else if (matchedDate.includes('-')) {
          const parts = matchedDate.split('-');
          if (parts.length === 3) {
            if (parts[2].length === 2) {
              parts[2] = '20' + parts[2];
            }
            date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        } else if (pattern.source.includes('invoice_date')) {
          // Handle "Mon Mar 30 2020" format
          try {
            const parsedDate = new Date(matchedDate);
            if (!isNaN(parsedDate.getTime())) {
              date = parsedDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.log('Failed to parse date:', matchedDate);
          }
        } else {
          date = matchedDate;
        }
        break;
      }
    }

    
    const amountPatterns = [
      /total_amount:\s*([\d,]+\.?\d*)/i,
      /(?:total|amount|sum|due):\s*[\$€£]?\s*([\d,]+\.?\d*)/i,
      /[\$€£]?\s*([\d,]+\.?\d*)\s*(?:total|amount|sum|due)/i,
      /(?:grand total|final amount):\s*[\$€£]?\s*([\d,]+\.?\d*)/i
    ];

    let amount = fallbackData.amount;
    for (const pattern of amountPatterns) {
      const match = extractedText.match(pattern);
      if (match && match[1]) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

 
    const taxIdPatterns = [
      /invoiced_number:\s*([A-Z0-9\-]+)/i,
      /(?:tax id|vat|tax number|ein):\s*([A-Z0-9\-]+)/i,
      /([A-Z]{2}\d{9,12})/, // EU VAT format
      /(\d{2}-\d{7})/, // US EIN format
      /([A-Z0-9]{10,15})/ // Generic tax ID
    ];

    let taxId = fallbackData.taxId;
    for (const pattern of taxIdPatterns) {
      const match = extractedText.match(pattern);
      if (match && match[1]) {
        taxId = match[1];
        break;
      }
    }

    return {
      vendor,
      date,
      amount,
      taxId
    };
  } catch (error) {
    console.error('Regex extraction error:', error);
    return fallbackData;
  }
}

export const getInvoices = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const invoices = await Invoice.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const formattedInvoices: IInvoiceResponse[] = invoices.map(invoice => ({
      id: invoice._id.toString(),
      userId: req.user!._id.toString(),
      vendor: invoice.vendor,
      date: invoice.date,
      amount: invoice.amount,
      taxId: invoice.taxId,
      fileUrl: invoice.fileUrl
    }));

    const response: IApiResponse<IInvoiceResponse[]> = {
      success: true,
      message: 'Invoices retrieved successfully',
      data: formattedInvoices
    };
    res.json(response);
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


async function checkUploadLimit(userId: string): Promise<{ allowed: boolean; message?: string; limit?: number; used?: number; remaining?: number }> {
  try {

    const user = await User.findById(userId);
    if (!user) {
      return { allowed: false, message: 'User not found' };
    }


    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      const invoiceCount = await Invoice.countDocuments({
        userId,
        createdAt: { $gte: currentMonth }
      });

      const freeLimit = 5;
      const remaining = freeLimit - invoiceCount;
      
      return {
        allowed: remaining > 0,
        message: remaining <= 0 ? 'Upload limit reached for Free plan' : undefined,
        limit: freeLimit,
        used: invoiceCount,
        remaining: Math.max(0, remaining)
      };
    }

        const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const invoiceCount = await Invoice.countDocuments({
      userId,
      createdAt: { $gte: currentMonth }
    });

    let uploadLimit: number;
    switch (subscription.plan) {
      case 'Free':
        uploadLimit = 5;
        break;
      case 'Pro':
      case 'Business':
        uploadLimit = -1; //
        break;
      default:
        uploadLimit = 5; 
    }

    if (uploadLimit === -1) {
      
      return {
        allowed: true,
        limit: -1,
        used: invoiceCount,
        remaining: -1
      };
    }

    const remaining = uploadLimit - invoiceCount;
    
    return {
      allowed: remaining > 0,
      message: remaining <= 0 ? `Upload limit reached for ${subscription.plan} plan` : undefined,
      limit: uploadLimit,
      used: invoiceCount,
      remaining: Math.max(0, remaining)
    };
  } catch (error) {
    console.error('Error checking upload limit:', error);
    return { allowed: false, message: 'Error checking upload limits' };
  }
}

export const uploadInvoice = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const limitCheck = await checkUploadLimit(req.user._id.toString());
    if (!limitCheck.allowed) {
      res.status(403).json({ 
        success: false, 
        message: limitCheck.message || 'Upload limit exceeded',
        data: {
          limit: limitCheck.limit,
          used: limitCheck.used,
          remaining: limitCheck.remaining
        }
      });
      return;
    }

    console.log('Processing uploaded file:', req.file.originalname, 'Type:', req.file.mimetype);

    let extractedText: string;
    try {
      extractedText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
      console.log('Extracted text length:', extractedText.length);
      console.log('Extracted text preview:', extractedText.substring(0, 200) + '...');
    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to extract text from file',
        data: fallbackData
      });
      return;
    }


    let extractedData: IInvoiceUploadResponse;
    try {
      extractedData = await extractInvoiceDataWithGemini(extractedText);
      console.log('Gemini extraction result:', extractedData);
    } catch (geminiError) {
      console.error('Gemini extraction failed, using regex fallback:', geminiError);
      extractedData = extractInvoiceDataWithRegex(extractedText);
      console.log('Regex extraction result:', extractedData);
    }


    const fileUrl = `/uploads/${req.file.filename}`;
    

    const response: IApiResponse<IInvoiceUploadResponse & { fileUrl: string }> = {
      success: true,
      message: 'Invoice data extracted successfully. Please review and save.',
      data: {
        ...extractedData,
        fileUrl
      }
    };
    res.json(response);
  } catch (error) {
    console.error('Error uploading invoice:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createInvoice = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    
    const limitCheck = await checkUploadLimit(req.user._id.toString());
    if (!limitCheck.allowed) {
      res.status(403).json({ 
        success: false, 
        message: limitCheck.message || 'Upload limit exceeded',
        data: {
          limit: limitCheck.limit,
          used: limitCheck.used,
          remaining: limitCheck.remaining
        }
      });
      return;
    }

    const { vendor, date, amount, taxId, fileUrl } = req.body;
    
  
    const finalFileUrl = fileUrl || '';
    
    const invoice = new Invoice({
      userId: req.user._id,
      vendor,
      date,
      amount: amount.toString(),
      taxId,
      fileUrl: finalFileUrl
    });
    await invoice.save();

    const formattedInvoice: IInvoiceResponse = {
      id: invoice._id.toString(),
      userId: req.user._id.toString(),
      vendor: invoice.vendor,
      date: invoice.date,
      amount: invoice.amount,
      taxId: invoice.taxId,
      fileUrl: invoice.fileUrl
    };

    const response: IApiResponse<IInvoiceResponse> = {
      success: true,
      message: 'Invoice created successfully',
      data: formattedInvoice
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateInvoice = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { vendor, date, amount, taxId } = req.body;

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { vendor, date, amount: amount.toString(), taxId },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    const formattedInvoice: IInvoiceResponse = {
      id: invoice._id.toString(),
      userId: req.user._id.toString(),
      vendor: invoice.vendor,
      date: invoice.date,
      amount: invoice.amount,
      taxId: invoice.taxId,
      fileUrl: invoice.fileUrl
    };

    const response: IApiResponse<IInvoiceResponse> = {
      success: true,
      message: 'Invoice updated successfully',
      data: formattedInvoice
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteInvoice = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const invoice = await Invoice.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    const response: IApiResponse = {
      success: true,
      message: 'Invoice deleted successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
