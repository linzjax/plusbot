import { Select, Var, Expr } from "faunadb"

export function getFaunaError(error) {
  const { code, description } = error.requestResult.responseContent.errors[0]
  let status

  switch (code) {
    case "unauthorized":
    case "authentication failed":
      status = 401
      break
    case "permission denied":
      status = 403
      break
    case "instance not found":
      status = 404
      break
    case "instance not unique":
    case "contended transaction":
      status = 409
      break
    default:
      status = 500
  }

  return { code, description, status }
}

export const getId = (variable: string | Expr) => {
  return Select(["ref", "id"], Var(variable))
}

export const getDataField = (
  variable: string | Expr,
  field: string | null = null
) => {
  return Select(["data", field], Var(variable))
}

export default getFaunaError
