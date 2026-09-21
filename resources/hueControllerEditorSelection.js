(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  if (root) root.HueStandaloneKNXUltimateHueControllerEditorSelection = api
}(typeof window !== 'undefined' ? window : globalThis, function () {
  const DEFAULT_EMPTY_VALUES = new Set(['', 'none', '_add_', '__none__'])

  function normalizeSelection (value, emptyValues = DEFAULT_EMPTY_VALUES) {
    const normalized = value === undefined || value === null ? '' : String(value).trim()
    const normalizedEmptyValues = emptyValues instanceof Set
      ? emptyValues
      : new Set(Array.isArray(emptyValues) ? emptyValues : DEFAULT_EMPTY_VALUES)
    return normalizedEmptyValues.has(normalized.toLowerCase()) ? '' : normalized
  }

  function shouldPreserveStoredSelection (event, nextValue, storedValue, emptyValues = DEFAULT_EMPTY_VALUES) {
    const programmaticChange = !event || !event.originalEvent
    return programmaticChange &&
      normalizeSelection(nextValue, emptyValues) === '' &&
      normalizeSelection(storedValue, emptyValues) !== ''
  }

  function resolveSelectedOrStoredSelection (selectedValue, storedValue, emptyValues = DEFAULT_EMPTY_VALUES) {
    return normalizeSelection(selectedValue, emptyValues) || normalizeSelection(storedValue, emptyValues)
  }

  function cloneEditorValue (value) {
    if (value === undefined || value === null || typeof value !== 'object') return value
    try { return JSON.parse(JSON.stringify(value)) } catch (error) { return value }
  }

  function createEditorDraft (node, defaults = {}) {
    const source = node && typeof node === 'object' ? node : {}
    const draft = Object.create(source)
    Object.entries(defaults || {}).forEach(([key, property]) => {
      const value = Object.prototype.hasOwnProperty.call(source, key)
        ? source[key]
        : property?.value
      draft[key] = cloneEditorValue(value)
    })
    return draft
  }

  return {
    cloneEditorValue,
    createEditorDraft,
    normalizeSelection,
    resolveSelectedOrStoredSelection,
    shouldPreserveStoredSelection
  }
}))
