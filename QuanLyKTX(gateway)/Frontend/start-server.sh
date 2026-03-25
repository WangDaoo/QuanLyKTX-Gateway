#!/bin/bash

echo "========================================"
echo "  QUAN LY KY TUC XA - FRONTEND SERVER"
echo "========================================"
echo ""
echo "Dang khoi dong server..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Su dung Python 3 HTTP Server..."
    echo ""
    echo "Server dang chay tai: http://localhost:8080"
    echo ""
    echo "Nhan Ctrl+C de dung server"
    echo ""
    python3 -m http.server 8080
    exit 0
fi

# Check if Python 2 is available
if command -v python &> /dev/null; then
    echo "Su dung Python 2 HTTP Server..."
    echo ""
    echo "Server dang chay tai: http://localhost:8080"
    echo ""
    echo "Nhan Ctrl+C de dung server"
    echo ""
    python -m SimpleHTTPServer 8080
    exit 0
fi

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "Su dung Node.js HTTP Server..."
    echo ""
    echo "Dang cai dat http-server..."
    npm install -g http-server > /dev/null 2>&1
    echo ""
    echo "Server dang chay tai: http://localhost:8080"
    echo ""
    echo "Nhan Ctrl+C de dung server"
    echo ""
    http-server -p 8080 -c-1
    exit 0
fi

echo "ERROR: Khong tim thay Python hoac Node.js!"
echo ""
echo "Vui long cai dat mot trong hai:"
echo "- Python: https://www.python.org/downloads/"
echo "- Node.js: https://nodejs.org/"
echo ""
echo "Hoac su dung Visual Studio Code voi extension 'Live Server'"
echo ""

