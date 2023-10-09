#!/usr/bin/env sh
set -e;
cd contract;
yarn compile;
cd ..;
cd factory;
./build.sh;
cd ..;
cd integration-tests;
yarn test;