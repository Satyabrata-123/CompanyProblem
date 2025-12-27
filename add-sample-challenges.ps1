# Add Sample Challenges to Database
Write-Host "Adding Sample Challenges to Database" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create a sample company
Write-Host "Step 1: Creating sample company..." -ForegroundColor Yellow
$companyData = @{
    name = "TechCorp Solutions"
    email = "contact@techcorp.com"
    industry = "Technology"
    description = "Leading technology company focused on innovation"
    website = "https://techcorp.com"
    isVerified = $true
} | ConvertTo-Json

try {
    $companyResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/companies" `
        -Method Post `
        -ContentType "application/json" `
        -Body $companyData
    
    $companyId = $companyResponse.id
    Write-Host "✅ Company created with ID: $companyId" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error creating company: $_" -ForegroundColor Red
    Write-Host "Trying to get existing companies..." -ForegroundColor Yellow
    
    $companies = Invoke-RestMethod -Uri "http://localhost:8080/api/companies" -Method Get
    if ($companies.Count -gt 0) {
        $companyId = $companies[0].id
        Write-Host "✅ Using existing company ID: $companyId" -ForegroundColor Green
    } else {
        Write-Host "❌ No companies found. Please create a company first." -ForegroundColor Red
        exit 1
    }
}

# Step 2: Create BEGINNER Challenge
Write-Host "Step 2: Creating BEGINNER challenge..." -ForegroundColor Yellow
$beginnerChallenge = @{
    challenge = @{
        companyId = $companyId
        title = "Build a Simple Todo App"
        description = "Create a basic todo application with add, delete, and mark complete features. This is perfect for beginners learning web development."
        requirements = "Must use HTML, CSS, and JavaScript. Should have a clean UI and store data in local storage."
        difficulty = "BEGINNER"
        category = "Web Development"
        rewardAmount = 500
        rewardCurrency = "USD"
        submissionDeadline = "2025-12-31T23:59:59"
        maxSubmissions = 50
        tags = "javascript,html,css,frontend"
        evaluationCriteria = "Code quality, functionality, UI/UX design, and code organization"
    }
    internalSolutionBrief = "A simple todo app with local storage persistence, clean UI, and basic CRUD operations"
} | ConvertTo-Json -Depth 10

try {
    $beginnerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/challenges" `
        -Method Post `
        -ContentType "application/json" `
        -Body $beginnerChallenge
    Write-Host "✅ BEGINNER challenge created: $($beginnerResponse.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating BEGINNER challenge: $_" -ForegroundColor Red
}
Write-Host ""

# Step 3: Create INTERMEDIATE Challenge
Write-Host "Step 3: Creating INTERMEDIATE challenge..." -ForegroundColor Yellow
$intermediateChallenge = @{
    challenge = @{
        companyId = $companyId
        title = "REST API with Authentication"
        description = "Build a RESTful API with JWT authentication and user management. Include login, register, and protected routes."
        requirements = "Must implement JWT authentication, password hashing, refresh tokens, and proper error handling."
        difficulty = "INTERMEDIATE"
        category = "Backend Development"
        rewardAmount = 1500
        rewardCurrency = "USD"
        submissionDeadline = "2025-12-31T23:59:59"
        maxSubmissions = 30
        tags = "api,jwt,authentication,nodejs,security"
        evaluationCriteria = "Security implementation, code structure, API design, and documentation"
    }
    internalSolutionBrief = "JWT-based authentication with refresh tokens, bcrypt password hashing, and role-based access control"
} | ConvertTo-Json -Depth 10

try {
    $intermediateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/challenges" `
        -Method Post `
        -ContentType "application/json" `
        -Body $intermediateChallenge
    Write-Host "✅ INTERMEDIATE challenge created: $($intermediateResponse.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating INTERMEDIATE challenge: $_" -ForegroundColor Red
}
Write-Host ""

# Step 4: Create EXPERT Challenge
Write-Host "Step 4: Creating EXPERT challenge..." -ForegroundColor Yellow
$expertChallenge = @{
    challenge = @{
        companyId = $companyId
        title = "Distributed System Design"
        description = "Design and implement a scalable microservices architecture that can handle high traffic and maintain fault tolerance."
        requirements = "Must handle 10k+ requests per second with fault tolerance, implement circuit breakers, and use event-driven architecture."
        difficulty = "EXPERT"
        category = "System Design"
        rewardAmount = 5000
        rewardCurrency = "USD"
        submissionDeadline = "2025-12-31T23:59:59"
        maxSubmissions = 10
        tags = "microservices,scalability,distributed-systems,kafka,docker"
        evaluationCriteria = "Scalability, fault tolerance, performance, monitoring, and documentation"
    }
    internalSolutionBrief = "Event-driven microservices with Kafka, Docker containers, load balancing, and circuit breakers"
} | ConvertTo-Json -Depth 10

try {
    $expertResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/challenges" `
        -Method Post `
        -ContentType "application/json" `
        -Body $expertChallenge
    Write-Host "✅ EXPERT challenge created: $($expertResponse.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating EXPERT challenge: $_" -ForegroundColor Red
}
Write-Host ""

# Step 5: Verify challenges were created
Write-Host "Step 5: Verifying challenges..." -ForegroundColor Yellow
try {
    $allChallenges = Invoke-RestMethod -Uri "http://localhost:8080/api/challenges" -Method Get
    Write-Host "✅ Total challenges in database: $($allChallenges.Count)" -ForegroundColor Green
    
    foreach ($challenge in $allChallenges) {
        Write-Host "  - [$($challenge.difficulty)] $($challenge.title)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error verifying challenges: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Done! Refresh your browser to see the challenges." -ForegroundColor Green
Write-Host ""
