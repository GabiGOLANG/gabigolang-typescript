import { Expression } from "./Expression";
import ExpressionVisitor from "../../interfaces/ExpressionVisitor";
import Token from "../../lexer/Token";

export class AccessObjectProperty implements Expression {
  constructor(
    public readonly object: Expression,
    public readonly token: Token,
    public readonly isSuperClassProperty: boolean = false
  ) {}

  public accept = <T>(visitor: ExpressionVisitor<T>): T =>
    visitor.visitAccessObjectPropertyExpression(this);
}
