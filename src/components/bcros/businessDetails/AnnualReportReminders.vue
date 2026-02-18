<script setup lang="ts">
const business = useBcrosBusiness()
const { currentBusinessContact } = storeToRefs(business)
const route = useRoute()
const t = useNuxtApp().$i18n.t
const arReminder = ref(true) // the saved value
const isToggled = ref(true) // the toggle model value
const isFetching = ref(false) // true while fetching
const isSaving = ref(false) // true while saving
const isFetchError = ref(false) // true if there was a fetch error
const isSaveError = ref(false) // true if there was a save error
const identifier = route.params.identifier as string

defineEmits<{(e:'close'): void}>()

const props = defineProps({
  attach: { type: String, default: '' },
  display: { type: Boolean, required: true }
})

const display = computed(() => props.display)

watch(display, async (display) => {
  if (display) {
    // whenever dialog is opened, fetch the current AR Reminder value
    try {
      isFetching.value = true // hide dialog
      arReminder.value = await business.fetchArReminder(identifier)
      isToggled.value = arReminder.value // sync toggle with current value
    } catch {
      isFetchError.value = true
    } finally {
      isFetching.value = false // show dialog
    }
  } else {
    // whenever dialog is closed, reset error flags
    isFetchError.value = false
    isSaveError.value = false
  }
})

const save = async () => {
  try {
    isSaveError.value = false // clear from previous save
    isSaving.value = true
    await business.saveArReminder(identifier, isToggled.value)
    arReminder.value = isToggled.value // sync current value with toggle
  } catch {
    isSaveError.value = true
  } finally {
    isToggled.value = arReminder.value // sync toggle with current value
    isSaving.value = false
  }
}

const options = computed(() => ({
  title: t('text.dialog.annualReportReminders.title'),
  text: '', // content slot is used instead
  buttons: [], // button slot is used instead
  headerLeft: true
}) as DialogOptionsI)
</script>

<template>
  <BcrosDialog
    :attach="attach"
    name="annualReportReminders"
    :display="!isFetching && display"
    :options="options"
    @close="$emit('close')"
  >
    <template #content>
      <div v-if="isFetchError" class="height-180px flex items-center justify-center">
        <p class="text-red-500">
          {{ $t('text.dialog.annualReportReminders.fetchError') }}
        </p>
      </div>

      <template v-else>
        <!-- use fixed height to prevent content shift when toggling -->
        <div class="height-80px">
          <!-- email reminders -->
          <h2 class="text-base">
            {{ $t('text.dialog.annualReportReminders.section1') }}
          </h2>

          <div class="flex items-center justify-between">
            <p class="text-bcGovGray-600">
              {{ $t('text.dialog.annualReportReminders.text1') }}
            </p>

            <label for="toggle-button" class="font-bold">
              {{ $t(!!arReminder
                ? 'text.dialog.annualReportReminders.emailsChecked'
                : 'text.dialog.annualReportReminders.emailsUnchecked'
              ) }}
            </label>

            <!-- use fixed width and height so loading icon and toggle are the same size -->
            <div class="w-10 height-22px">
              <UIcon
                v-if="isSaving"
                class="text-2xl text-gray-700 animate-spin"
                name="i-mdi-loading"
              />
              <UToggle
                v-else
                id="toggle-button"
                v-model="isToggled"
                on-icon="i-heroicons-check-20-solid"
                off-icon="i-heroicons-x-mark-20-solid"
                color="blue"
                :ui="{
                  inactive: 'bg-[#757575]',
                  icon: { off: 'text-[#757575]' }
                }"
                @change="save()"
              />
            </div>
          </div>

          <p class="text-red-500 text-sm text-right">
            {{ isSaveError ? $t('text.dialog.annualReportReminders.saveError') : '' }}
          </p>
        </div>

        <!-- use fixed height to prevent content shift when toggling -->
        <div class="height-100px">
          <!-- current email address -->
          <template v-if="arReminder">
            <UDivider />

            <div class="mt-7">
              <h2 class="text-base">
                {{ $t('text.dialog.annualReportReminders.section2') }}
              </h2>
              <p class="text-bcGovGray-600">
                {{ $t('text.dialog.annualReportReminders.text2') }}
              </p>
              <p class="tracking-wide">
                {{ currentBusinessContact.email }}
              </p>
            </div>
          </template>

          <!-- message box -->
          <BcrosMessageBox v-else>
            <div class="flex items-start gap-3">
              <UIcon
                class="h-6 w-12 text-yellow-500"
                name="i-mdi-warning"
              />
              <span>
                {{ $t('text.dialog.annualReportReminders.messageBoxText') }}
              </span>
            </div>
          </BcrosMessageBox>
        </div>
      </template>
    </template>

    <template #buttons>
      <div class="flex justify-center">
        <!-- use min width so icon and text are the same width -->
        <UButton
          class="py-2 min-w-24 flex justify-center"
          data-cy="close-button"
          :disabled="isSaving"
          @click="$emit('close')"
        >
          <UIcon
            v-if="isSaving"
            class="text-2xl text-white animate-spin"
            name="i-mdi-loading"
          />
          <div v-else class="text-base">
            {{ isFetchError ? $t('button.dialog.close') : $t('button.dialog.done') }}
          </div>
        </UButton>
      </div>
    </template>
  </BcrosDialog>
</template>

<style scoped>
.height-22px {
  height: 22px;
}

.height-80px {
  height: 80px;
}

.height-100px {
  height: 100px;
}

.height-180px {
  height: 180px;
}
</style>
