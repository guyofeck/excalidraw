import {
  DEFAULT_GRID_SIZE,
  KEYS,
  MOBILE_ACTION_BUTTON_BG,
  arrayToMap,
} from "@excalidraw/common";

import { getCommonBounds, getNonDeletedElements } from "@excalidraw/element";

import { LinearElementEditor } from "@excalidraw/element";

import {
  getSelectedElements,
  getSelectionStateForElements,
} from "@excalidraw/element";

import { syncMovedIndices } from "@excalidraw/element";

import { duplicateElements } from "@excalidraw/element";

import { CaptureUpdateAction } from "@excalidraw/element";

import { IconButton } from "../components/IconButton";
import { DuplicateIcon } from "../components/icons";

import { t } from "../i18n";
import { isSomeElementSelected } from "../scene";
import { getShortcutKey } from "../shortcut";

import { useStylesPanelMode } from "../components/App";

import { register } from "./register";

export const actionDuplicateSelection = register<{
  duplicateToRight?: boolean;
} | null>({
  name: "duplicateSelection",
  label: "labels.duplicateSelection",
  icon: DuplicateIcon,
  trackEvent: { category: "element" },
  perform: (elements, appState, formData, app) => {
    if (appState.selectedElementsAreBeingDragged) {
      return false;
    }

    // duplicate selected point(s) if editing a line
    if (
      appState.selectedLinearElement?.isEditing &&
      !formData?.duplicateToRight
    ) {
      // TODO: Invariants should be checked here instead of duplicateSelectedPoints()
      try {
        const newAppState = LinearElementEditor.duplicateSelectedPoints(
          appState,
          app.scene,
        );

        return {
          elements,
          appState: newAppState,
          captureUpdate: CaptureUpdateAction.IMMEDIATELY,
        };
      } catch {
        return false;
      }
    }

    const selectedElements = getSelectedElements(elements, appState, {
      includeBoundTextElement: true,
      includeElementsInFrames: true,
    });
    let offsetX = DEFAULT_GRID_SIZE / 2;
    let offsetY = DEFAULT_GRID_SIZE / 2;
    if (formData?.duplicateToRight) {
      if (!selectedElements.length) {
        return false;
      }
      const [minX, , maxX] = getCommonBounds(selectedElements);
      offsetX = maxX - minX + 20;
      offsetY = 0;
    }

    let { duplicatedElements, elementsWithDuplicates } = duplicateElements({
      type: "in-place",
      elements,
      idsOfElementsToDuplicate: arrayToMap(selectedElements),
      appState,
      randomizeSeed: true,
      overrides: ({ origElement, origIdToDuplicateId }) => {
        const duplicateFrameId =
          origElement.frameId && origIdToDuplicateId.get(origElement.frameId);
        return {
          x: origElement.x + offsetX,
          y: origElement.y + offsetY,
          frameId: duplicateFrameId ?? origElement.frameId,
        };
      },
    });

    if (app.props.onDuplicate && elementsWithDuplicates) {
      const mappedElements = app.props.onDuplicate(
        elementsWithDuplicates,
        elements,
      );
      if (mappedElements) {
        elementsWithDuplicates = mappedElements;
      }
    }

    return {
      elements: syncMovedIndices(
        elementsWithDuplicates,
        arrayToMap(duplicatedElements),
      ),
      appState: {
        ...appState,
        ...getSelectionStateForElements(
          duplicatedElements,
          getNonDeletedElements(elementsWithDuplicates),
          appState,
        ),
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
  keyTest: (event) => event[KEYS.CTRL_OR_CMD] && event.key === KEYS.D,
  PanelComponent: ({ elements, appState, updateData, app }) => {
    const isMobile = useStylesPanelMode() === "mobile";

    return (
      <IconButton
        type="button"
        icon={DuplicateIcon}
        title={`${t("labels.duplicateSelection")} — ${getShortcutKey(
          "CtrlOrCmd+D",
        )}`}
        aria-label={t("labels.duplicateSelection")}
        onClick={() => updateData(null)}
        disabled={
          !isSomeElementSelected(getNonDeletedElements(elements), appState)
        }
        style={{
          ...(isMobile && appState.openPopup !== "compactOtherProperties"
            ? MOBILE_ACTION_BUTTON_BG
            : {}),
        }}
      />
    );
  },
});

export const actionDuplicateSelectionToRight = register({
  name: "duplicateSelectionToRight",
  label: "labels.duplicateSelectionToRight",
  icon: DuplicateIcon,
  trackEvent: { category: "element" },
  predicate: (elements, appState) =>
    isSomeElementSelected(getNonDeletedElements(elements), appState),
  perform: (elements, appState, _formData, app) =>
    actionDuplicateSelection.perform(
      elements,
      appState,
      { duplicateToRight: true },
      app,
    ),
});
