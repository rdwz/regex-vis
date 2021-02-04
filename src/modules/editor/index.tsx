import React, { useState, useEffect } from "react"
import BookOpen from "@geist-ui/react-icons/bookOpen"
import Edit from "@geist-ui/react-icons/edit"
import { Tabs } from "@geist-ui/react"
import { Node } from "@/types"
import EditTab, { InsertDirection } from "./tabs/edit"
import LegendTab from "./tabs/legend"
import { useEventListener } from "../../utils/hooks"
type Props = {
  nodes: Node[]
  onInsert?: (direction: InsertDirection) => void
  onRemove?: () => void
  onGroup: (type: string, name: string) => void
  onUndo: () => void
  onRedo: () => void
}

type Tab = "legend" | "edit"

const Editor: React.FC<Props> = props => {
  const {
    nodes,
    onInsert = () => {},
    onRemove,
    onGroup,
    onRedo,
    onUndo,
  } = props

  const [tabValue, setTabValue] = useState<Tab>("legend")

  useEffect(() => {
    if (nodes.length === 0) {
      setTabValue("legend")
    } else {
      setTabValue("edit")
    }
  }, [nodes])
  const editDisabled = nodes.length === 0

  useEventListener("keydown", (e: Event) => {
    const event = e as KeyboardEvent
    const { key } = event
    if (key === "Backspace") {
      return onRemove && onRemove()
    }
    const metaKey = event.ctrlKey || event.metaKey
    if (metaKey && key === "z") {
      return onUndo()
    }
    if (metaKey && event.shiftKey && key === "z") {
      return onRedo()
    }
  })
  return (
    <>
      <div className="container">
        <Tabs
          value={tabValue}
          onChange={(value: string) => setTabValue(value as Tab)}
          hideDivider
        >
          <Tabs.Item
            value="legend"
            label={
              <>
                <BookOpen />
                Legend
              </>
            }
          >
            <LegendTab />
          </Tabs.Item>
          <Tabs.Item
            value="edit"
            label={
              <>
                <Edit />
                Edit
              </>
            }
            disabled={editDisabled}
          >
            <EditTab nodes={nodes} onGroup={onGroup} onInert={onInsert} />
          </Tabs.Item>
        </Tabs>
      </div>
      <style jsx>{`
        .container {
          width: 800px;
          margin: 24px auto;
        }
      `}</style>
    </>
  )
}

export default Editor