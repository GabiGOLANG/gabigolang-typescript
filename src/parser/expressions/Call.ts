import { Expression } from "./Expression";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";
import Token from "../../lexer/Token";

export class Call implements Expression {
  constructor(
    public callee: Expression,
    public parenteses: Token,
    public args: Expression[]
  ) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitCallExpression(this);
}
