import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.posdashboard",
  appName: "POS Dashboard",
  webDir: "../out",
  server: {
    androidScheme: "https",
    iosScheme: "https"
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/LocalDatabase",
      electronLinuxLocation: "Databases",
      androidDatabaseLocation: "default"
    }
  }
};

export default config;


