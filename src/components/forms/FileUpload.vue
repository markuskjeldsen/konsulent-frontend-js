<template>
  <div class="file-upload-wrap" :class="{ 'is-disabled': disabled }">
    <input
      :id="inputId"
      ref="inputEl"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :capture="capture"
      :disabled="disabled"
      @change="onChange"
      class="file-input-sr"
    />

    <label class="file-upload" :for="inputId" :aria-disabled="disabled">
      <span v-if="icon" class="file-upload__icon" aria-hidden="true">{{ icon }}</span>
      <span class="file-upload__title">{{ title }}</span>
      <span v-if="hint" class="file-upload__hint">{{ hint }}</span>
    </label>
    <!-- Preview -->
    <div v-if="filesToShow.length" class="file-upload__preview">
      <template v-if="showThumbnails">
        <div
          class="thumb"
          v-for="(f, i) in filesToShow.slice(0, maxPreviews)"
          :key="f.preview || f.name"
        >
          <img :src="f.preview" :alt="f.name || 'Billede ' + (i + 1)" loading="lazy" />
        </div>
        <div v-if="filesToShow.length > maxPreviews" class="thumb more">
          +{{ filesToShow.length - maxPreviews }}
        </div>
      </template>
      <template v-else-if="showCount">
        <p class="file-count">
          Valgt: {{ filesToShow.length }} fil<span v-if="filesToShow.length !== 1">er</span>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  id: { type: String, default: '' },
  title: { type: String, default: 'Vælg filer' },
  hint: { type: String, default: 'Tryk for at vælge (flere tilladt)' },
  icon: { type: String, default: '📷' },
  accept: { type: String, default: 'image/*' },
  multiple: { type: Boolean, default: true },
  capture: { type: [String, Boolean], default: undefined },
  disabled: { type: Boolean, default: false },

  /* New: control preview behavior */
  showCount: { type: Boolean, default: true },
  showThumbnails: { type: Boolean, default: true },
  maxPreviews: { type: Number, default: 4 },

  /* Optional: bind files from parent to reflect its state */
  files: { type: Array, default: () => [] },
})

const emit = defineEmits(['images', 'change', 'input-cleared', 'update:files'])

const inputEl = ref(null)
const rnd = Math.random().toString(36).slice(2)
const inputId = computed(() => props.id || `file-${rnd}`)

/* Local previews when parent doesn't pass files */
const filesLocal = ref([])

/* Unify source of truth for rendering */
const filesToShow = computed(() => (props.files?.length ? props.files : filesLocal.value))

function buildPreviews(fileList) {
  // Create objects with preview URLs (don’t persist non-images)
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  const arr = Array.from(fileList || []).filter((f) => !allowed.length || allowed.includes(f.type))
  return arr.map((file) => ({
    file,
    name: file.name,
    preview: URL.createObjectURL(file),
  }))
}

function revokeAll(urls) {
  urls.forEach((u) => {
    try {
      URL.revokeObjectURL(u)
    } catch {}
  })
}

let lastLocalUrls = []

function onChange(e) {
  emit('images', e)
  emit('change', e)

  // Build previews locally if parent is not providing files
  if (!props.files?.length) {
    // cleanup previous
    revokeAll(lastLocalUrls)
    const previews = buildPreviews(e.target.files)
    filesLocal.value = previews
    lastLocalUrls = previews.map((p) => p.preview)
  }

  // Also emit an update so parent can opt-in to bind files
  const previews = buildPreviews(e.target.files)
  emit('update:files', previews)
}

function clear() {
  if (inputEl.value) inputEl.value.value = ''
  // Clear local previews
  revokeAll(lastLocalUrls)
  filesLocal.value = []
  lastLocalUrls = []
  emit('input-cleared')
}

/* If parent-controlled files change, clean up old local URLs (we don’t own parent URLs) */
watch(
  () => props.files,
  (nv, ov) => {
    if (!ov || ov === nv) return
    // When switching from local to parent-controlled, drop local URLs
    if (lastLocalUrls.length && props.files?.length) {
      revokeAll(lastLocalUrls)
      filesLocal.value = []
      lastLocalUrls = []
    }
  },
)

onBeforeUnmount(() => {
  revokeAll(lastLocalUrls)
})

defineExpose({ clear })
</script>

<style scoped>
:root {
  --brand: rgb(99, 170, 219);
  --brand-10: rgba(99, 170, 219, 0.1);
  --brand-20: rgba(99, 170, 219, 0.2);
  --text: #1f2a37;
  --muted: #6b7280;
  --bg-hover: #f7fbff;
}

.file-upload-wrap {
  max-width: 720px;
  margin: 24px auto;
  padding: 0 16px;
}

.file-input-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.file-upload {
  display: grid;
  grid-template-columns: 48px 1fr;
  grid-template-rows: auto auto;
  grid-column-gap: 12px;
  align-items: center;

  border: 2px dashed var(--brand);
  background: var(--brand-10);
  border-radius: 12px;

  padding: 20px 16px;
  text-align: left;
  color: var(--text);
  cursor: pointer;
  min-height: 72px;

  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    transform 80ms ease;
}

.file-upload__icon {
  grid-row: 1 / span 2;
  font-size: 28px;
  line-height: 1;
}

.file-upload__title {
  font-size: 16px;
  font-weight: 600;
}

.file-upload__hint {
  font-size: 14px;
  color: var(--muted);
  margin-top: 2px;
}

.file-upload:hover {
  background-color: var(--brand-20);
}
.file-upload:active {
  transform: scale(0.99);
}

.file-input-sr:focus + .file-upload,
.file-upload:focus,
.file-upload:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px white,
    0 0 0 6px var(--brand);
  background-color: var(--bg-hover);
}

.is-disabled .file-upload {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (forced-colors: active) {
  .file-upload {
    border-style: solid;
  }
}
@media (prefers-reduced-motion: reduce) {
  .file-upload {
    transition: none;
  }
}
@media (max-width: 420px) {
  .file-upload {
    grid-template-columns: 40px 1fr;
    padding: 16px;
    border-radius: 10px;
  }
  .file-upload__icon {
    font-size: 24px;
  }
  .file-upload__title {
    font-size: 15px;
  }
  .file-upload__hint {
    font-size: 13px;
  }
}
.file-upload__preview {
  margin-top: 10px;
}

.file-count {
  margin: 8px 2px 0;
  color: var(--muted);
  font-size: 14px;
}

/* Responsive thumbnail grid */
.file-upload__preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 8px;
}

.thumb {
  position: relative;
  width: 100%;
  padding-top: 100%; /* square */
  border-radius: 8px;
  overflow: hidden;
  background: #f2f4f7;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.thumb img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb.more {
  display: grid;
  place-items: center;
  color: var(--text);
  background: var(--brand-10);
  font-weight: 600;
}
</style>
