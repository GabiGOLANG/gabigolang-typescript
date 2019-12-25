import { Statement } from "./Statement";
import StatementVisitor from "../../interfaces/StatementVisitor";

export class Block implements Statement {
  constructor(public readonly statements: Statement[]) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitBlockStatement(this);
}
