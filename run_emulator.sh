#!/bin/bash
# https://firebase.google.com/docs/functions/local-emulator

_firebase_sec_file='testfirebase-63a18-ad7d95cba895.json'
_path='/Users/'`whoami`'/Documents/Dev/Projects/MbMWeb2_0/workarea/testFirebase/PyFirebaseTest'
# echo $_path/$_firebase_sec_file
export GOOGLE_APPLICATION_CREDENTIALS=$_path/$_firebase_sec_file
export FIRESTORE_EMULATOR_HOST=localhost:8080
firebase emulators:start
