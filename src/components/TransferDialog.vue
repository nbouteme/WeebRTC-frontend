<template>
    <div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";
import { TransferArgs } from "@/views/Home.vue";
import { sendMessage, CommandType, readMessage } from "@/SignallingServer";
import { Peer } from "@/FileTransferPeer";

@Component
export default class TransferDialog extends Vue {
  @Prop()
  token!: string;

  async created() {
    await sendMessage(JSON.stringify([CommandType.Join, this.token]));
    let message = await readMessage<boolean>();
    if (!message) return this.$router.replace("/");

    // ICE ne termine pas si l'initiateur de l'offre... ne fait pas d'offre.

    let filechannel = await Peer.createChannel("file");
    let datachannel = await Peer.createChannel("data");
    let offer = await Peer.createOffer();
    await Peer.setSDP(offer);
    console.log("waiting session desc");
    let reply = await readMessage<RTCSessionDescriptionInit>();
    await Peer.setRemoteDescription(reply);
    console.log("gathering candidates");

    let nextCandidate = async function * () {
      let cand: RTCIceCandidate;
      let stop: boolean;
      do {
        cand = await readMessage<RTCIceCandidate>();
        yield cand;
      } while (!cand || !cand.candidate);
    };
    for await (let cand of await nextCandidate()) {
      Peer.addIceCandidate(cand);
    }
    console.log("finished gathering");
    await filechannel.open();
    while (filechannel.dc.readyState === "open") {
      console.log("waiting file info");
      this.$emit("inputfile", await filechannel.read());
    }
  }
}
</script>
