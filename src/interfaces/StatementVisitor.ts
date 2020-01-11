import * as Stmt from "../parser/statements";

export default interface StatementVisitor<T> {
  visitBlockStatement(statement: Stmt.Block): T;
  visitExpressionStatement(statement: Stmt.Expression): T;
  visitPrintStatement(statement: Stmt.Print): T;
  visitLetStatement(statement: Stmt.Let): T;
  visitConstStatement(statement: Stmt.Const): T;
  visitIfStatement(statement: Stmt.If): T;
  visitWhileStatement(statement: Stmt.While): T;
  visitFunctionStatement(statement: Stmt.Function): T;
  visitReturnStatement(statement: Stmt.Return): T;
  visitClassStatement(statement: Stmt.Class): T;
}
