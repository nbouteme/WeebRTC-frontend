<template>
    <div>
        <TransferOptions v-if="!files || !files.length" @update="updateOpts" :opts="opts"></TransferOptions>
        <OptionDisplay v-else :opts="opts"/>
        <TokenDisplay :long="opts.long"></TokenDisplay>
        <FileSender @selection="handleSelect" v-if="!opts.encrypted || validEnc(opts.key)" :opts="opts"></FileSender>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { FileInfo } from "@/views/Transfer.vue";

import TransferOptions from "@/components/TransferOptions.vue";
import TokenDisplay from "@/components/TokenDisplay.vue";
import FileSender from "@/components/FileSender.vue";
import OptionDisplay from "@/components/OptionDisplay.vue";
import { validEnc } from '@/utils';

@Component({
  components: {
    TransferOptions,
    FileSender,
    TokenDisplay,
    OptionDisplay
  }
})
export default class Home extends Vue {
  opts: TransferArgs = { encrypted: false, key: "", long: true };
  files: FileInfo | null = null;
  validEnc = validEnc;

  handleSelect(files: FileInfo | null) {
    this.files = files;
  }

  updateOpts(newval: TransferArgs) {
    this.opts = newval;
  }
}
</script>
