import StatementVisitor from "../../interfaces/StatementVisitor";

export interface Statement {
  accept<T>(visitor: StatementVisitor<T>): T;
}
