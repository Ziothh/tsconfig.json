#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const __errorAndExit = (error) => {
    console.error(error);
    process.exit(1);
};
const hasArgv = (arg) => process.argv.some(consoleArg => consoleArg === arg);
const CONFIG_FOLDER_PATH = path_1.default.resolve(__dirname, "..", 'config');
const DEFAULT_TECHNOLOGY = "web";
const useDefault = hasArgv("-y");
const configFiles = {};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield (0, promises_1.readdir)(CONFIG_FOLDER_PATH).catch(__errorAndExit);
    for (let f of files) {
        const frameworkName = f.split('.')[1];
        configFiles[frameworkName] = path_1.default.join(CONFIG_FOLDER_PATH, f);
    }
    const technologyName = useDefault ? DEFAULT_TECHNOLOGY : (yield inquirer_1.default.prompt([{
            type: "list",
            message: "Pick the technology you're using:",
            name: "technology",
            choices: Object.keys(configFiles)
                .sort((a, _) => a === DEFAULT_TECHNOLOGY ? -1 : 0)
                .map(tName => ({
                name: tName === DEFAULT_TECHNOLOGY ? `${tName} [default]` : tName,
                value: tName,
            })),
            default: DEFAULT_TECHNOLOGY,
        }])).technology;
    const config = yield (0, promises_1.readFile)(configFiles[technologyName]).catch(__errorAndExit);
    const generatedTsconfigPath = path_1.default.join(process.cwd(), 'tsconfig.json');
    yield (0, promises_1.writeFile)(generatedTsconfigPath, config.toString()).catch(__errorAndExit);
    console.log("tsconfig.json successfully created");
}))();
