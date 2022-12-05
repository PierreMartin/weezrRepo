You will need Node >=12 and npm >= 5.6 on your machine.
Setting up the development environment with "React Native CLI Quickstart" here => https://reactnative.dev/docs/environment-setup

On Apple Silicon M1, follow this :
https://dev.to/handipriyono/solve-react-native-build-failed-on-m1-macbook-pro-air-2fo4

Install manually react-native-vector-icons :

    1) Follow these instructions (by option manually) : https://github.com/oblador/react-native-vector-icons#installation
    1bis) if fonts already installed before => delete fonts from xcode in "Copy Bundle Resources" 
    2) Update pod : cd ios && pod install (if error with Mac M1, run in Rosetta terminal)
    3) Run build from Xcode (Run Shift + Command + K to clean last build & Command + B to start a new build)
    4) npm run ios

To run the project:

    $ git clone https://github.com/PierreMartin/weezrRepo.git
    $ cd weezrRepo/server
    $ npm i
    $ npm run server

In another terminal:

    $ cd weezr
    $ npm i
    $ npm run start
    
Then, in another terminal in /weezr, run simulator / device (on Apple Silicon M1, run on a rosetta terminal !!):

    $ npm run ios / npm run android
    Or
    Navigate to the `/ios` folder, open the `.xcworkspace`, select your device in build target then click on "Build and run" button

## troubleshooting 

FOR ANDROID:

    NOTE 1: on Mac, maybe you need to run `source ~/.[path/file_where_android_SDK_environment_variables_is]` (exemple `source ~/.bash_profile`) before run `npm run android`
    NOTE 2: Maybe you need to `wipe data` in emulator before run `npm run android`
    NOTE 3: If you have some url like 'localhost', replace by 'http://192.xxx.x.xx'

If Gradle is stuck at downloading NDK =>
    https://stackoverflow.com/questions/71601864/gradle-is-stuck-at-downloading-ndk

If error "Task :react-native-location:compileDebugJavaWithJavac FAILED"
    cd android and then ./gradlew clean
    npx jetifier



FOR IOS:
For Change Default iOS Simulator Device:
    npx react-native run-ios --simulator="iPhone 13 Pro Max"

If `pod install` has errors => run `pod install --repo-update`

If issue with caches => 
- To reset the iOS simulator and erase all simulator data go to menu and Hardware -> Erase All Content and Settings
- In Xcode, press Option+Shift+Command+K
- watchman watch-del-all
- npm start -- --reset-cache

NOTE:
- Pay attention to the Apollo cache, you will need to wait a few seconds for get updated data (ex: wait a few when you test with web-sockets), or just click for immediately update changed data

