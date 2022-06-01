#!/usr/bin/env node
import inquirer from "inquirer"
import path from "path";
import { writeFile, readdir, readFile } from "fs/promises";

// TODO: add minimist if you want to dig deeper into using args

// Helpers
const __errorAndExit = (error: any) => {
    console.error(error)
    process.exit(1)
}
const hasArgv = (arg: string) => process.argv.some(
    consoleArg => consoleArg === arg
);


// Constants
const CONFIG_FOLDER_PATH = path.resolve(__dirname, "..", 'config');
const DEFAULT_TECHNOLOGY = "web"


// Script
/** A map of the frameworknames and the absolute file path to their tsconfig */
interface IConfigFileMap {
    [technologyName: string]: string
}

const getConfigFileName = async (configFiles: IConfigFileMap): Promise<string> => {
    const useDefault = hasArgv("-y");

    const files = await readdir(CONFIG_FOLDER_PATH).catch(__errorAndExit);

    for (const f of files) {
        // framework name is situated between 2 dots eg- react between 2 '.'(s)
        const frameworkName = f.split('.')[1];
        configFiles[frameworkName] = path.join(CONFIG_FOLDER_PATH, f);
    }

    const technologyNames = Object.keys(configFiles)

    if (useDefault) return DEFAULT_TECHNOLOGY
    
    const technologyFlag = technologyNames.find(t => hasArgv(`--${t}`))
    if (technologyFlag !== undefined) return technologyFlag

    return (await inquirer.prompt([{
        type: "list",
        message: "Pick the technology you're using:",
        name: "technology",
        choices: Object.keys(configFiles)
        // Set the default value as the first value
        .sort((a, _) => a === DEFAULT_TECHNOLOGY ? -1 : 0)
        // Add [default] to the default value name
        .map(tName => ({
            // key: "TODO",
            name: tName === DEFAULT_TECHNOLOGY ? `${tName} [default]` : tName,
            value: tName,
        })),
        default: DEFAULT_TECHNOLOGY,
    }])).technology as string
}


(async () => {
    const configFiles: IConfigFileMap = {};

    const technologyName = await getConfigFileName(configFiles)
    console.log("You chose: ", technologyName)

    const config = await readFile(configFiles[technologyName]).catch(__errorAndExit);

    const generatedTsconfigPath = path.join(process.cwd(), 'tsconfig.json');

    // ? Maybe I'll add this back in later
    //   if (technology === "node") {
    //     const reg = new RegExp(/(?<=v)(\d+)/);
    //     const version = parseInt(reg.exec(process.version)![0]);

    //     if (version >= 14) {
    //       // Optimal config for Node v14.0.0 (full ES2020)
    //       const updateConfig = {
    //         allowSyntheticDefaultImports: true,
    //         lib: ["es2020"],
    //         module: "commonjs",
    //         moduleResolution: "node",
    //         target: "es2020",
    //       };

    //       const configObj = Object.keys(updateConfig).reduce((prev, curr) => {
    //         return {
    //           ...prev,
    //           compilerOptions: {
    //             ...prev.compilerOptions,
    //             [curr]: updateConfig[curr],
    //           },
    //         };
    //       }, JSON.parse(config.toString()));

    //       config = JSON.stringify(configObj, null, 2);
    //     }
    //   }

    await writeFile(generatedTsconfigPath, config.toString()).catch(__errorAndExit);

    console.log("tsconfig.json successfully created");
})();
