import { readFileSync } from "fs";

import Parser from "./parser/Parser";
import Lexer from "./lexer/Lexer";
import Interpreter from "./interpreter/Interpreter";
import Resolver from "./resolver/Resolver";

function main(): void {
  const source = readFileSync("./main.yajs", "utf8");

  const lexer = new Lexer(source);
  const parser = new Parser(lexer.lex());
  const interpreter = new Interpreter();
  const resolver = new Resolver(interpreter);

  const { ok, statements } = parser.parse();

  if (ok) {
    resolver.resolve(statements);
    interpreter.interpret(statements);
  }
}
main();
