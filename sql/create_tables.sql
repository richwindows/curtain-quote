-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS quotes;

-- 创建报价表
CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    quote_number INTEGER NOT NULL,
    customer_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    location TEXT,
    product TEXT NOT NULL,
    valance TEXT NOT NULL,
    valance_color TEXT NOT NULL,
    bottom_rail TEXT NOT NULL,
    control TEXT NOT NULL,
    fabric TEXT NOT NULL,
    fabric_price DECIMAL(10,2),
    motor_price DECIMAL(10,2),
    width_inch DECIMAL(10,3),
    width_m DECIMAL(10,3),
    height_inch DECIMAL(10,3),
    height_m DECIMAL(10,3),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_quotes_customer_name ON quotes(customer_name);

-- 为了确保quote_number的唯一性和递增，创建一个序列
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 10001; 


ALTER TABLE quotes ADD COLUMN location TEXT;