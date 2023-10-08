#!/usr/bin/env sh
set -e
cd contract;
yarn compile;
cd ..
cd integration-tests;
yarn test;