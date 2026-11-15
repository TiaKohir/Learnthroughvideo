import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
Config.setCrf(23);

// Use the pre-installed Chromium when present (cloud container); otherwise Remotion downloads its own.
const chrome = process.env.BROWSER_EXECUTABLE || "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
if (existsSync(chrome)) Config.setBrowserExecutable(chrome);
