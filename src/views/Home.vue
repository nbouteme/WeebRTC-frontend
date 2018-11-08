<template>
    <div>
        <TransferOptions @update="updateOpts" :opts="opts"></TransferOptions>
        <TokenDisplay :long="opts.long"></TokenDisplay>
        <FileSender :opts="opts"></FileSender>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TransferOptions from "@/components/TransferOptions.vue";
import TokenDisplay from "@/components/TokenDisplay.vue";
import FileSender from "@/components/FileSender.vue";

export class TransferArgs {
    encrypted: boolean = false;
    key?: string = '';
    long: boolean = true;
}

@Component({
  components: {
    TransferOptions,
    FileSender,
    TokenDisplay
  }
})
export default class Home extends Vue {
    opts: TransferArgs = new TransferArgs;

    updateOpts(newval: TransferArgs) {
        this.opts = newval;    
    }
}
</script>
