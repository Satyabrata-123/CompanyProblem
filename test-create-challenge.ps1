# Test creating a challenge
Write-Host "Testing Challenge Creation" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Get company ID
Write-Host "Getting company ID..." -ForegroundColor Yellow
try {
    $companies = Invoke-RestMethod -Uri "http://localhost:8080/api/companies" -Method Get
    if ($companies.Count -eq 0) {
        Write-Host "No companies found. Creating one..." -ForegroundColor Yellow
        $companyData = @{
            name = "Test Company"
            email = "test@company.com"
            industry = "Technology"
            description = "Test company"
            website = "https://test.com"
            isVerified = $true
        } | ConvertTo-Json
        
        $company = Invoke-RestMethod -Uri "http://localhost:8080/api/companies" `
            -Method Post `
            -ContentType "application/json" `
            -Body $companyData
        $companyId = $company.id
    } else {
        $companyId = $companies[0].id
    }
    Write-Host "Using company ID: $companyId" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Create a simple challenge
Write-Host ""
Write-Host "Creating BEGINNER challenge..." -ForegroundColor Yellow

$challengeData = @{
    challenge = @{
        companyId = $companyId
        title = "Simple Todo App"
        description = "Build a todo application"
        requirements = "Use HTML, CSS, JavaScript"
        difficulty = "BEGINNER"
        category = "Web Development"
        rewardAmount = 500.0
        rewardCurrency = "USD"
        submissionDeadline = "2025-12-31T23:59:59"
        maxSubmissions = 50
        tags = "javascript,html"
        evaluationCriteria = "Code quality"
    }
    internalSolutionBrief = "A simple todo app"
} | ConvertTo-Json -Depth 10

Write-Host "Request body:" -ForegroundColor Cyan
Write-Host $challengeData
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/challenges" `
        -Method Post `
        -ContentType "application/json" `
        -Body $challengeData
    
    Write-Host "✅ Challenge created successfully!" -ForegroundColor Green
    Write-Host "Challenge ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Title: $($response.title)" -ForegroundColor Cyan
    Write-Host "Difficulty: $($response.difficulty)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creating challenge:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""
