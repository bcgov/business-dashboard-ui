<script setup lang="ts">
import type { CommentIF } from '@bcrs-shared-components/interfaces'
import { createComment } from '~/utils/filings'

const t = useNuxtApp().$i18n.t
const noChangesSinceSave = ref(false)

const props = withDefaults(defineProps<{
    comments?: Array<CommentIF>,
    showCloseModal?: boolean,
    filing: ApiResponseFilingI
  }>(), {
  comments: () => [],
  showCloseModal: true
})

defineEmits(['close'])

const MAX_COMMENT_LENGTH = 2000
const commentToAdd = ref('')

watch(commentToAdd, (newComment, oldComment) => {
  if (newComment !== oldComment) {
    noChangesSinceSave.value = false
  }
})
const error = computed((): string => {
  if (!commentToAdd || !commentToAdd.value || commentToAdd.value.length === 0) {
    if (noChangesSinceSave.value === true) {
      return ''
    }
    return t('label.comments.commentRequired')
  }
  // if (commentToAdd && commentToAdd.value && commentToAdd.value.length > MAX_COMMENT_LENGTH) {
  //   return t('label.comments.commentTooLong', MAX_COMMENT_LENGTH)
  // }
  return ''
})

const textAreaUi = {
  rounded: '',
  variant: {
    bottom:
      'bg-transparent border-b-2 border-b-bcGovGray-600 focus:border-b-bcGovGray-600 focus:ring-0 focus:shadow-none',
    bottomError:
      'bg-transparent border-b-2 border-b-red-600 focus:border-b-red-600 focus:ring-0 focus:shadow-none'
  }
}

const saveComment = async () => {
  if (error.value !== '') {
    return
  }
  if (commentToAdd.value.length > MAX_COMMENT_LENGTH) {
    return
  }

  if (commentToAdd.value.length === 0) {
    return
  }

  try {
    await createComment(props.filing, commentToAdd.value)
  } catch (e) {
    error.value = `Error saving comment: ${e.message}`
  }

  commentToAdd.value = ''
  noChangesSinceSave.value = true
}

</script>

<template>
  <!-- comment-text-->
  <div class="px-5 py-5">
    <slot name="comment-header">
      <span class="text-primary-600">
        <UIcon name="i-mdi-comment-text" class="w-5 h-5" />
        {{ $t('label.comments.comment', (comments?.length || 0 )) }}
      </span>
      <span v-if="showCloseModal" class="float-right">
        <UIcon name="i-mdi-close" class="w-5 h-5 cursor-pointer" @click="$emit('close')" />
      </span>
    </slot>

    <slot name="comment-add-area">
      <div class="mb-6" data-cy="comment-add-slot">
        <UTextarea
          v-model="commentToAdd"
          data-cy="comment-add-textarea"
          :variant="error ? 'bottomError' : 'bottom'"
          :rows="5"
          :ui="textAreaUi"
        />
        <p v-if="error" class="text-red-600">
          {{ error }}
        </p>
        <p v-if="MAX_COMMENT_LENGTH - commentToAdd.length >= 0">
          {{ (MAX_COMMENT_LENGTH - commentToAdd.length) }}
        </p>
        <p v-else class="text-red-600">
          {{ $t('label.comments.charactersExceeded', (commentToAdd.length - MAX_COMMENT_LENGTH)) }}
        </p>
        <div class="flex justify-end">
          <UButton
            class="text-primary-600 px-3 py-2 font-bold mb-2"
            variant="ghost"
            data-cy="save-comment"
            @click="saveComment()"
          >
            <span>{{ $t('label.comments.save') }}</span>
          </UButton>
          <UButton
            class="text-primary-600 px-3 py-2 mb-2"
            variant="ghost"
            :disabled="!commentToAdd || commentToAdd.length === 0"
            data-cy="cancel-save-comment"
            @click="commentToAdd = ''"
          >
            <span>{{ $t('label.comments.cancel') }}</span>
          </UButton>
        </div>
      </div>
    </slot>

    <slot name="comment-list">
      <div
        class="pt-8 overflow-y-scroll absolute inset-x-0 bottom-5 h-[calc(100%-275px)]"
        data-cy="comment-list"
      >
        <div v-for="comment, index in comments" :key="index">
          <p class="pb-2">
            {{ comment.comment }}
          </p>
          <p class="italic pb-2">
            {{ comment.submitterDisplayName }} - {{ apiToPacificDateTime(comment.timestamp) }}
          </p>
          <UDivider class="mb-2" />
        </div>
      </div>
    </slot>
  </div>
</template>
