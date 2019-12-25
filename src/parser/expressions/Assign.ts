import { Expression } from "./Expression";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";
import Token from "../../lexer/Token";

export class Assign implements Expression {
  constructor(public name: Token, public value: Expression) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitAssignExpression(this);
}
