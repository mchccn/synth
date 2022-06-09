#!/usr/bin/env node

import cli from "./cli/index.js";

if (import.meta.url.endsWith("bin.js")) cli();
