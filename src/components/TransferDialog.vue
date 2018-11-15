<template>
    <div>
      {{$t('message.' + status)}}
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { sendMessage, CommandType, readMessage } from "@/SignallingServer";
import { Peer } from "@/FileTransferPeer";
import { FileInfo } from "@/views/Transfer.vue";
import { messages } from '@/localization';

@Component
export default class TransferDialog extends Vue {
  @Prop()
  token!: string;

  status: keyof typeof messages['en']['message'] = "none";

  async created() {
    try {
      await sendMessage(JSON.stringify([CommandType.Join, this.token]));
      let message = await readMessage<boolean>();
      if (!message) return this.$router.replace("/");
      this.status = "connectedLobby";
      let filechannel = await Peer.createChannel("file");
      let datachannel = await Peer.createChannel("data");
      let offer = await Peer.createOffer();
      await Peer.setSDP(offer);
      let reply = await readMessage<RTCSessionDescriptionInit>();
      await Peer.setRemoteDescription(reply);

      let nextCandidate = async function * () {
        let cand: RTCIceCandidate;
        do {
          cand = await readMessage<RTCIceCandidate>();
          yield cand;
        } while (!cand || !cand.candidate);
      };
      for await (let cand of await nextCandidate()) {
        Peer.addIceCandidate(cand);
      }
      await Peer.connect();
      await filechannel.open();
      this.status = "connectedPeer";
      while (filechannel.dc.readyState === "open") {
        this.$emit("inputfile", await filechannel.read<FileInfo>());
      }
    } catch (e) {
      this.$emit('error', e);
    }
  }
}
</script>
