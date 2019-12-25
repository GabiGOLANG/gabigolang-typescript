import { Expression } from "./Expression";
import Token from "../../lexer/Token";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";

export class Variable implements Expression {
  constructor(public name: Token) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitVariableExpression(this);
}
