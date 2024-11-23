import * as fs from "node:fs/promises";
import { Command } from "commander";
import chalk from "chalk";
import { isPath2Dir, smartReplace } from "./utils.js";

// create a new command instance
const program = new Command("lspork").description(
  "CLI Smart Find and Replace Tool"
);

program
  .command("replace <path> <search> [instruction]")
  .description(
    "Find and replace text in files; If instruction is not provided," /
      "all occurrences of search will be removed," /
      "otherwise, all occurrences of search will be replaced based on the instruction"
  )
  .action(async (path, search, instruction) => {
    // Step 1: Check if path is a directory
    if (!(await isPath2Dir(path))) {
      console.error(chalk.red("Path is not a directory"));
      process.exit(1);
    }

    // Step 2: Loop through all files in the directory (non-recursive)
    const files = await fs.readdir(path);
    let affectedFilesCount = 0;

    files.forEach(async (file, index) => {
      // Step 3: Read the content of each file
      const filePath = `${path}/${file}`;
      const content = await fs.readFile(filePath, {
        encoding: "utf-8",
        flag: "r",
      });

      // Step 4: Use AI to find and replace text
      const result = await smartReplace(content, search, instruction);
      if (!result) {
        console.error(chalk.red(`Failed to process file: ${file}`));
        return;
      }

      // Step 5: Write the new content back to the file
      await fs.writeFile(filePath, result);
      affectedFilesCount++;

      console.log(
        chalk.green(`[${index + 1}] Successfully processed file: ${file}`)
      );
    });

    console.info(chalk.green(`
      Total number of files found: ${files.length}
      Number of files affected: ${affectedFilesCount}
    `));
  });

program.parse(process.argv);
