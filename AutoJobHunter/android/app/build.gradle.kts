plugins { id("com.android.application") }
android {
 namespace = "ca.autojobhunter.app"
 compileSdk = 35
 defaultConfig { applicationId = "ca.autojobhunter.app"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "0.1.0" }
 buildTypes { getByName("release") { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}