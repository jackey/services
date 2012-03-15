#!/bin/bash

forever start -l .log -o .out -e .err --append server.js

