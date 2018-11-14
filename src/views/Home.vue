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

import { FileInfo } from '@/views/Transfer.vue';

import TransferOptions from "@/components/TransferOptions.vue";
import TokenDisplay from "@/components/TokenDisplay.vue";
import FileSender from "@/components/FileSender.vue";
import OptionDisplay from "@/components/OptionDisplay.vue";

export class TransferArgs {
    encrypted: boolean = false;
    key: string = '';
    long: boolean = true;
}

@Component({
  components: {
    TransferOptions,
    FileSender,
    TokenDisplay,
    OptionDisplay,
  }
})
export default class Home extends Vue {
    opts: TransferArgs = new TransferArgs;
    files: FileInfo | null = null;

    handleSelect(files: FileInfo | null) {
        this.files = files;
    }

    validEnc(k: string) {
        k = k.toLowerCase();
        return k.match(/^ *[0-9a-f]{64} *$/g);
    }

    updateOpts(newval: TransferArgs) {
        this.opts = newval;    
    }
}
</script>
