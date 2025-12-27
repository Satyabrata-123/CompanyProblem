@echo off
echo Adding Sample Challenges to Database
echo =====================================
echo.

echo First, let's create a sample company...
curl -X POST http://localhost:8080/api/companies ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"TechCorp\",\"email\":\"contact@techcorp.com\",\"industry\":\"Technology\",\"description\":\"Leading tech company\",\"website\":\"https://techcorp.com\",\"isVerified\":true}"
echo.
echo.

echo Creating BEGINNER Challenge...
curl -X POST http://localhost:8080/api/challenges ^
  -H "Content-Type: application/json" ^
  -d "{\"challenge\":{\"companyId\":\"REPLACE_WITH_COMPANY_ID\",\"title\":\"Build a Simple Todo App\",\"description\":\"Create a basic todo application with add, delete, and mark complete features\",\"requirements\":\"Must use HTML, CSS, and JavaScript\",\"difficulty\":\"BEGINNER\",\"category\":\"Web Development\",\"rewardAmount\":500,\"rewardCurrency\":\"USD\",\"submissionDeadline\":\"2025-12-31T23:59:59\",\"maxSubmissions\":50,\"tags\":\"javascript,html,css\",\"evaluationCriteria\":\"Code quality, functionality, UI/UX\"},\"internalSolutionBrief\":\"A simple todo app with local storage\"}"
echo.
echo.

echo Creating INTERMEDIATE Challenge...
curl -X POST http://localhost:8080/api/challenges ^
  -H "Content-Type: application/json" ^
  -d "{\"challenge\":{\"companyId\":\"REPLACE_WITH_COMPANY_ID\",\"title\":\"REST API with Authentication\",\"description\":\"Build a RESTful API with JWT authentication and user management\",\"requirements\":\"Must include login, register, and protected routes\",\"difficulty\":\"INTERMEDIATE\",\"category\":\"Backend Development\",\"rewardAmount\":1500,\"rewardCurrency\":\"USD\",\"submissionDeadline\":\"2025-12-31T23:59:59\",\"maxSubmissions\":30,\"tags\":\"api,jwt,authentication\",\"evaluationCriteria\":\"Security, code structure, API design\"},\"internalSolutionBrief\":\"JWT-based authentication with refresh tokens\"}"
echo.
echo.

echo Creating EXPERT Challenge...
curl -X POST http://localhost:8080/api/challenges ^
  -H "Content-Type: application/json" ^
  -d "{\"challenge\":{\"companyId\":\"REPLACE_WITH_COMPANY_ID\",\"title\":\"Distributed System Design\",\"description\":\"Design and implement a scalable microservices architecture\",\"requirements\":\"Must handle 10k+ requests per second with fault tolerance\",\"difficulty\":\"EXPERT\",\"category\":\"System Design\",\"rewardAmount\":5000,\"rewardCurrency\":\"USD\",\"submissionDeadline\":\"2025-12-31T23:59:59\",\"maxSubmissions\":10,\"tags\":\"microservices,scalability,distributed-systems\",\"evaluationCriteria\":\"Scalability, fault tolerance, performance\"},\"internalSolutionBrief\":\"Event-driven microservices with Kafka\"}"
echo.
echo.

echo Done! Challenges added.
echo.
echo NOTE: You need to replace REPLACE_WITH_COMPANY_ID with the actual company ID from the first response.
echo.
pause
