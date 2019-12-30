import { readFileSync } from "fs";

import Parser from "./parser/Parser";
import Lexer from "./lexer/Lexer";
import Interpreter from "./interpreter/Interpreter";

function main(): void {
  const source = readFileSync("./main.yajs", "utf8");

  const lexer = new Lexer(source);
  const parser = new Parser(lexer.lex());
  const interpreter = new Interpreter();

  const { ok, statements } = parser.parse();

  if (ok) {
    interpreter.interpret(statements);
  }
}
main();
