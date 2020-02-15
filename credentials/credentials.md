Alias name: handshake
Password: sLM$0ERgB197%7#O

# Create Keystore
`keytool -genkey -v -keystore handshake-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias handshake`

# Sign APK
`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore handshake-release-key.jks app-release-unsigned.apk handshake`

# Zipalign
`/Users/vipin/Library/Android/sdk/build-tools/28.0.3/zipalign -v 4 app-release-unsigned.apk handshake.apk`

# APK signer
`/Users/vipin/Library/Android/sdk/build-tools/28.0.3/apksigner verify handshake.apk`