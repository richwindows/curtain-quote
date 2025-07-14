const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db = null;

async function openDB() {
  if (db) return db;
  
  const dbPath = path.join(process.cwd(), 'quotes.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // 创建报价表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_number INTEGER,
      customer_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      product TEXT NOT NULL,
      valance TEXT NOT NULL,
      valance_color TEXT NOT NULL,
      bottom_rail TEXT NOT NULL,
      control TEXT NOT NULL,
      fabric TEXT NOT NULL,
      fabric_price REAL,
      motor_price REAL,
      width_inch REAL NOT NULL,
      height_inch REAL NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 添加新字段（如果不存在）
  try {
    await db.exec(`ALTER TABLE quotes ADD COLUMN unit_price REAL`);
  } catch (error) {
    // 列已存在，忽略错误
  }
  
  try {
    await db.exec(`ALTER TABLE quotes ADD COLUMN motor_price REAL`);
  } catch (error) {
    // 列已存在，忽略错误
  }
  
  try {
    await db.exec(`ALTER TABLE quotes ADD COLUMN quote_number INTEGER`);
  } catch (error) {
    // 列已存在，忽略错误
  }
  
  return db;
}

async function saveQuote(quoteData) {
  const database = await openDB();
  
  // 计算单价和总价
  const unitPrice = quoteData.unitPrice || quoteData.total_price / parseInt(quoteData.quantity) || 0;
  const totalPrice = quoteData.totalPrice || quoteData.total_price || (unitPrice * parseInt(quoteData.quantity));
  
  // 为报价单生成quote_number（如果是多item报价的一部分，使用相同的quote_number）
  let quoteNumber = quoteData.quote_number;
  if (!quoteNumber) {
    // 生成新的报价单号码，从10001开始
    const result = await database.get('SELECT MAX(quote_number) as maxNumber FROM quotes');
    quoteNumber = Math.max((result.maxNumber || 0) + 1, 10001);
  }
  
  const result = await database.run(`
    INSERT INTO quotes (
      quote_number, customer_name, phone, email, address, product,
      valance, valance_color, bottom_rail, control, fabric,
      fabric_price, motor_price, width_inch, height_inch, quantity, 
      unit_price, total_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    quoteNumber,
    quoteData.customer_name || null,
    quoteData.phone || null,
    quoteData.email || null,
    quoteData.address || null,
    quoteData.product,
    quoteData.valance,
    quoteData.valance_color,
    quoteData.bottom_rail,
    quoteData.control,
    quoteData.fabric,
    quoteData.fabric_price || null,
    quoteData.motor_price || null,
    quoteData.width_inch,
    quoteData.height_inch,
    quoteData.quantity,
    unitPrice,
    totalPrice
  ]);
  
  return { id: result.lastID, quoteNumber: quoteNumber };
}

// 保留向后兼容性
async function createQuote(quoteData) {
  return await saveQuote(quoteData);
}

async function getAllQuotes() {
  const database = await openDB();
  return await database.all('SELECT * FROM quotes ORDER BY created_at DESC');
}

async function getQuoteById(id) {
  const database = await openDB();
  return await database.get('SELECT * FROM quotes WHERE id = ?', [id]);
}

async function getQuotesByPage(page = 1, limit = 10) {
  const database = await openDB();
  const offset = (page - 1) * limit;
  
  // 获取按报价单分组的数据
  const quotes = await database.all(`
    SELECT 
      quote_number,
      customer_name,
      phone,
      email,
      address,
      COUNT(*) as item_count,
      SUM(total_price) as total_amount,
      GROUP_CONCAT(product || ' (' || quantity || ')') as products_summary,
      MIN(created_at) as created_at
    FROM quotes 
    GROUP BY quote_number, customer_name, phone, email, address
    ORDER BY quote_number DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  
  // 获取总页数
  const countResult = await database.get(`
    SELECT COUNT(DISTINCT quote_number) as total
    FROM quotes
  `);
  
  const totalPages = Math.ceil(countResult.total / limit);
  
  return {
    quotes,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages
  };
}

async function getQuoteDetails(quoteNumber) {
  const database = await openDB();
  return await database.all('SELECT * FROM quotes WHERE quote_number = ? ORDER BY id', [quoteNumber]);
}

async function deleteQuote(quoteNumber) {
  const database = await openDB();
  const result = await database.run('DELETE FROM quotes WHERE quote_number = ?', [quoteNumber]);
  return result.changes > 0;
}

module.exports = {
  openDB,
  saveQuote,
  createQuote, // 向后兼容
  getAllQuotes,
  getQuoteById,
  getQuotesByPage,
  getQuoteDetails,
  deleteQuote
}; 