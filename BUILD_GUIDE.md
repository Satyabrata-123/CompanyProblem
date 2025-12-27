# Build Guide

## ✅ Build Status

All services have been built successfully!

- ✅ Common Module
- ✅ Idea Service (with Kafka support)
- ✅ AI Service (with Kafka support)

## 🔨 Build Scripts

### Build All Services
```cmd
build-all-services.bat
```

This builds all services in the correct order:
1. Common Module (required first!)
2. Eureka
3. API Gateway
4. Idea Service
5. User Service
6. Company Service
7. AI Service
8. Gamification Service

### Build Common Module Only
```cmd
build-common-module.bat
```

Use this when you update event classes or DTOs in the common module.

## 📦 Build Order (Important!)

**Always build in this order:**

1. **Common Module** ← Must be built first!
   - Contains shared DTOs and event classes
   - Required by all other services

2. **Other Services**
   - Can be built in any order after common

## 🚨 Common Build Errors

### Error: "package com.innovation.common.event does not exist"

**Solution**: Build common module first
```cmd
build-common-module.bat
```

### Error: "cannot find symbol: class IdeaSubmittedEvent"

**Solution**: Build common module first
```cmd
cd common
mvn clean install -DskipTests
cd ..
```

### Error: Compilation failure

**Solution**: Build all services
```cmd
build-all-services.bat
```

## 🔄 When to Rebuild

### Rebuild Common Module When:
- ✅ You add new event classes
- ✅ You modify existing DTOs
- ✅ You add new shared classes

### Rebuild Specific Service When:
- ✅ You modify that service's code
- ✅ You add new dependencies
- ✅ You change configuration

### Rebuild All Services When:
- ✅ First time setup
- ✅ After pulling new code
- ✅ After major changes

## 📊 Build Commands

### Maven Commands

```cmd
# Clean and build
mvn clean install -DskipTests

# Build without tests
mvn install -DskipTests

# Clean only
mvn clean

# Run tests
mvn test

# Package only
mvn package
```

### Quick Commands

```cmd
# Build everything
build-all-services.bat

# Build common only
build-common-module.bat

# Start services
start-all-services.bat

# Start with Kafka
start-all-with-kafka.bat
```

## 🎯 Typical Workflow

### First Time Setup
```cmd
# 1. Build all services
build-all-services.bat

# 2. Start services
start-all-services.bat
```

### After Code Changes
```cmd
# If you changed common module
build-common-module.bat

# If you changed specific service
cd idea-service
mvn clean install -DskipTests
cd ..

# Restart that service
```

### With Kafka
```cmd
# 1. Build all services
build-all-services.bat

# 2. Format Kafka storage (first time only)
kafka-scripts\format-kafka-storage.bat

# 3. Start everything with Kafka
start-all-with-kafka.bat
```

## 📁 Build Artifacts

After building, you'll find:

```
service-name/target/
  ├── service-name-1.0.0.jar          ← Executable JAR
  ├── service-name-1.0.0.jar.original ← Original JAR
  └── classes/                        ← Compiled classes
```

## ✨ Tips

1. **Always build common first** if you're building manually
2. **Use build-all-services.bat** for clean builds
3. **Skip tests** during development with `-DskipTests`
4. **Check logs** if build fails
5. **Clean before build** if you have issues

## 🔍 Verify Build

### Check if JAR exists
```cmd
dir idea-service\target\*.jar
dir ai-service\target\*.jar
```

### Check common module
```cmd
dir common\target\*.jar
```

### Check Maven repository
```cmd
dir %USERPROFILE%\.m2\repository\com\innovation\common\1.0.0\
```

## 📖 Related Documentation

- **KAFKA_IMPLEMENTATION_GUIDE.md** - Kafka code implementation
- **KAFKA_QUICK_START.md** - Kafka setup
- **start-all-services.bat** - Service startup
- **start-all-with-kafka.bat** - Kafka + services startup

---

**All services are built and ready to run!** 🚀
