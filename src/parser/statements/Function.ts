import { Statement } from "./Statement";
import Token from "../../lexer/Token";
import StatementVisitor from "../../interfaces/StatementVisitor";

export class Function implements Statement {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Statement[]
  ) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitFunctionStatement(this);
}
