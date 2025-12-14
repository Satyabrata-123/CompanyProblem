# Spring Boot DevTools Setup

## ✅ DevTools Added to All Services

Spring Boot DevTools has been added to all microservices for enhanced development experience:

### Services Updated:
- ✅ **AI Service** (8085)
- ✅ **Company Service** (8086) 
- ✅ **User Service** (8082)
- ✅ **Idea Service** (8081)
- ✅ **Voting Service** (8083)
- ✅ **Gamification Service** (8084)
- ✅ **API Gateway** (8080)
- ✅ **Eureka Server** (8761)

## 🚀 DevTools Features Enabled

### 1. **Automatic Restart**
- Automatically restarts the application when classpath files change
- Much faster than manual restart (only reloads changed classes)
- Triggered by saving Java files in your IDE

### 2. **LiveReload**
- Automatically refreshes browser when static resources change
- Works with HTML, CSS, JavaScript files
- No need to manually refresh the browser

### 3. **Property Defaults**
- Disables template caching in development
- Enables debug logging for web requests
- Optimizes settings for development

### 4. **Remote Development**
- Supports remote debugging and development
- Can connect to applications running on remote servers

## 🛠️ How to Use

### IDE Setup (IntelliJ IDEA):
1. **Enable Build Project Automatically:**
   - Go to `File → Settings → Build → Compiler`
   - Check "Build project automatically"

2. **Enable Running Application Updates:**
   - Go to `File → Settings → Advanced Settings`
   - Check "Allow auto-make to start even if developed application is currently running"

### IDE Setup (VS Code):
1. **Install Java Extension Pack**
2. **Enable Auto Save:**
   - Go to `File → Auto Save`
3. **Use Maven/Gradle tasks for running services**

### Manual Trigger:
- Save any Java file in the service
- DevTools will detect the change and restart the service
- Check console for "Restarting due to X file changes" message

## 📝 Development Workflow

1. **Start Services:** Use `start-all-services.bat` as usual
2. **Make Changes:** Edit Java files in your IDE
3. **Save Files:** DevTools automatically detects and restarts
4. **Test Changes:** Changes are live within seconds

## ⚡ Performance Benefits

- **Cold Start:** ~30-60 seconds (full application restart)
- **DevTools Restart:** ~3-10 seconds (only changed classes)
- **LiveReload:** Instant for static resources

## 🔧 Configuration

DevTools is configured with optimal defaults:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

### Key Settings:
- `scope=runtime`: Only active during development
- `optional=true`: Not included in production builds
- Automatically disabled in production environments

## 🚨 Important Notes

1. **Production Safety:** DevTools is automatically disabled when running with `java -jar`
2. **Memory Usage:** Slightly higher memory usage during development
3. **IDE Integration:** Works best with modern IDEs that support automatic compilation
4. **Database:** Database connections are preserved during restarts

## 🧪 Testing DevTools

1. Start any service (e.g., AI Service)
2. Make a small change to a controller or service class
3. Save the file
4. Watch the console for restart message
5. Test the API endpoint to see changes

**Example Test:**
- Edit `AiController.java`
- Add a new endpoint or modify existing one
- Save file
- Service restarts automatically
- Test the endpoint immediately

## 💡 Pro Tips

- **Exclude Directories:** DevTools ignores `/META-INF/maven`, `/META-INF/resources`, `/resources`, `/static`, `/public`, `/templates` by default
- **Custom Exclusions:** Add `spring.devtools.restart.exclude` property if needed
- **Trigger File:** Create `.reloadtrigger` file to manually trigger restarts
- **Remote Secret:** Use `spring.devtools.remote.secret` for remote development

The development experience is now significantly improved with instant feedback on code changes!