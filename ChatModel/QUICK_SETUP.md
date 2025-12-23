# ChatModel Quick Setup Guide

## Installation

### Option 1: Automatic Installation (Recommended)
```bash
cd ChatModel
install_dependencies.bat
```

### Option 2: Manual Installation
```bash
cd ChatModel

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Required Dependencies

The following packages will be installed:

- **flask** - Web framework
- **flask-cors** - CORS support
- **python-dotenv** - Environment variables
- **google-genai** - Google Gemini API
- **langchain-google-genai** - Langchain integration
- **requests** - HTTP client
- **psutil** - System monitoring (for performance tracking)

## Configuration

1. **Set Gemini API Key** in `.env` file (in parent directory):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. Get your API key from: https://makersuite.google.com/app/apikey

## Starting the Service

### Option 1: Using Batch File
```bash
start_service.bat
```

### Option 2: Manual Start
```bash
venv\Scripts\activate
python chatModel.py
```

The service will start on **http://localhost:5000**

## Verify Installation

### Check Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "innovation-chat-model",
  "gemini_available": true,
  "version": "1.0.0"
}
```

### Check System Status
```bash
curl http://localhost:5000/chat/system-status
```

## Performance Monitoring

The ChatModel includes **automatic performance monitoring** that prints to the terminal:

- ⏱️ Request duration
- 💾 Memory usage
- 🔄 CPU usage
- 📊 Success rate
- ⚠️ Performance warnings

Example output:
```
================================================================================
⚡ PERFORMANCE REPORT
================================================================================
Operation:     AI Comparison (Gemini)
Status:        ✅ SUCCESS
Duration:      2.345s
Match Score:   87.5
Memory Usage:  145.23 MB
CPU Usage:     12.5%
================================================================================
```

## Troubleshooting

### Error: "No module named 'psutil'"
**Solution**:
```bash
venv\Scripts\pip install psutil
```

### Error: "No module named 'langchain_google_genai'"
**Solution**:
```bash
venv\Scripts\pip install langchain-google-genai
```

### Error: "Gemini AI unavailable"
**Solution**:
1. Check `.env` file has `GEMINI_API_KEY`
2. Verify API key is valid
3. System will use fallback algorithm automatically

### Service won't start
**Solution**:
1. Check Python version: `python --version` (need 3.8+)
2. Reinstall dependencies: `install_dependencies.bat`
3. Check port 5000 is not in use

## Testing

### Test AI Comparison
```bash
curl -X POST http://localhost:5000/chat/compare-with-solution ^
  -H "Content-Type: application/json" ^
  -d "{\"ideaTitle\":\"WebSocket Chat\",\"ideaDescription\":\"Real-time chat using WebSocket, Redis, MongoDB\",\"companySolution\":\"WebSocket + Redis + MongoDB\"}"
```

### Expected Response
```json
{
  "success": true,
  "comparison": {
    "matchScore": 87.5,
    "matchLevel": "GOOD",
    "isCorrectSolution": true,
    "feedback": "Excellent work!...",
    "strengths": "Strong technical approach...",
    "improvements": "Consider adding..."
  }
}
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/chat/system-status` | GET | System status |
| `/chat/compare-with-solution` | POST | Compare idea with solution |
| `/chat/analyze-idea` | POST | Analyze idea |

## Performance Tips

1. **Monitor Terminal**: Watch for performance warnings
2. **Check Memory**: Should stay under 500 MB
3. **API Response Time**: Gemini typically responds in 1-3 seconds
4. **Success Rate**: Should be above 95%

## Common Issues

### Slow Performance (> 5s)
- Check internet connection
- Verify Gemini API status
- Consider shorter prompts

### High Memory (> 500 MB)
- Restart service
- Check for memory leaks
- Limit concurrent requests

### Low Success Rate (< 90%)
- Check Gemini API key
- Verify API quota
- Review error logs

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure API key
3. ✅ Start service
4. ✅ Test endpoints
5. ✅ Monitor performance
6. ✅ Integrate with backend

## Support

For detailed documentation, see:
- **PERFORMANCE_MONITORING.md** - Performance monitoring details
- **CHATMODEL_COMPARISON_SUMMARY.md** - AI comparison overview
- **CHATMODEL_QUICK_TEST.md** - Testing guide

---

**Ready to start!** Run `install_dependencies.bat` then `start_service.bat`
