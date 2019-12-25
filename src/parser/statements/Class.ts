/* import { Statement } from "./Statement";
import Token from "../../lexer/Token";
import StatementVisitor from "../../interfaces/StatementVisitor";

export class Class implements Statement {
  constructor(
    public name: Token,
    public superclass: Variable,
    public methods: Method[]
  ) {}

  public accept = <T>(visitor: StatementVisitor<T>): T =>
    visitor.visitClassStatement(this);
}
 */
