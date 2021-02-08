import { Node, GroupKind } from "@/types"
import { remove, insert, group } from "@/parser/utils"
import parser from "@/parser"
export type InitialStateType = {
  regex: string
  nodes: Node[]
  selectedNodes: Node[]
  undoStack: Node[][]
  redoStack: Node[][]
}

const DEFAULT_REGEX = `/[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+(a|b)/`
// const DEFAULT_REGEX = `/a[.]{1,33333}a/`
// const DEFAULT_REGEX = `/(a)/`
const DEFAULT_NODES = parser.parse(DEFAULT_REGEX)
export const initialState: InitialStateType = {
  regex: "",
  nodes: DEFAULT_NODES,
  selectedNodes: [],
  undoStack: [DEFAULT_NODES],
  redoStack: [],
}

export enum ActionTypes {
  SET_REGEX = "SET_REGEX",
  INSERT = "INSERT_NODE",
  REMOVE = "REMOVE_NODES",
  GROUP = "GROUP_NODES",
  SET_NODES = "SET_NODES",
  SET_SELECTED = "SET_SELECTED",
  UNDO = "UNDO",
  REDO = "REDO",
  SELECT_NODES = "SELECT_NODES",
}

export type Action =
  | {
      type: ActionTypes.SET_REGEX
      payload: { regex: string }
    }
  | {
      type: ActionTypes.INSERT
      payload: { direction: "prev" | "next" | "branch" }
    }
  | { type: ActionTypes.REMOVE }
  | { type: ActionTypes.GROUP; payload: { groupType: GroupKind | "nonGroup" } }
  | { type: ActionTypes.SET_NODES; payload: { nodes: Node[] } }
  | { type: ActionTypes.SET_SELECTED; payload: { selectedNodes: Node[] } }
  | { type: ActionTypes.UNDO }
  | { type: ActionTypes.REDO }
  | {
      type: ActionTypes.SELECT_NODES
      payload: { selected: Node[] | Node }
    }

const setNodes = (
  state: InitialStateType,
  nextNodes: Node[],
  attachState: Partial<InitialStateType> = {}
) => {
  const { undoStack, nodes } = state
  undoStack.push(nodes)
  return {
    ...state,
    ...attachState,
    nodes: nextNodes,
    undoStack,
  }
}

export const homeReducer = (state: InitialStateType, action: Action) => {
  switch (action.type) {
    case ActionTypes.SET_REGEX: {
      const { regex } = action.payload
      const nextNodes = parser.parse(regex)
      return setNodes(state, nextNodes, { regex })
    }
    case ActionTypes.INSERT: {
      const { nodes, selectedNodes } = state
      const { direction } = action.payload
      const nextNodes = insert(nodes, selectedNodes, direction)
      return setNodes(state, nextNodes)
    }
    case ActionTypes.REMOVE: {
      const { nodes, selectedNodes } = state
      const nextNodes = remove(nodes, selectedNodes)
      return setNodes(state, nextNodes, { selectedNodes: [] })
    }
    case ActionTypes.GROUP: {
      const { nodes, selectedNodes } = state
      const { groupType } = action.payload
      const { nextNodes, nextSelectedNodes } = group(
        nodes,
        selectedNodes,
        groupType
      )
      return setNodes(state, nextNodes, { selectedNodes: nextSelectedNodes })
    }
    case ActionTypes.SET_NODES: {
      const { undoStack, nodes } = state
      const { nodes: nextNodes } = action.payload
      undoStack.push(nodes)
      return setNodes(state, nextNodes, { undoStack })
    }
    case ActionTypes.SET_SELECTED: {
      const { selectedNodes } = action.payload
      return {
        ...state,
        selectedNodes,
      }
    }
    case ActionTypes.UNDO: {
      const { undoStack, redoStack, nodes } = state
      if (undoStack.length > 0) {
        const nextNodes = undoStack.pop()
        redoStack.push(nodes)
        return {
          ...state,
          nodes: nextNodes as Node[],
          undoStack,
          redoStack,
        }
      }
      return state
    }
    case ActionTypes.REDO: {
      const { undoStack, redoStack, nodes } = state
      if (redoStack.length > 0) {
        const nextNodes = redoStack.pop()
        undoStack.push(nodes)
        return {
          ...state,
          nodes: nextNodes as Node[],
          undoStack,
          redoStack,
        }
      }
      return state
    }
    case ActionTypes.SELECT_NODES: {
      const { selectedNodes } = state
      let { selected: nextSelected } = action.payload

      if (
        !Array.isArray(nextSelected) &&
        selectedNodes.length === 1 &&
        !!selectedNodes.find(({ id }) => (nextSelected as Node).id === id)
      ) {
        return {
          ...state,
          selectedNodes: [],
        }
      }
      if (!Array.isArray(nextSelected)) {
        nextSelected = [nextSelected]
      }
      return {
        ...state,
        selectedNodes: nextSelected,
      }
    }
    default:
      return state
  }
}
