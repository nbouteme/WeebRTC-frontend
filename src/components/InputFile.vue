<template>
    <div>
      <button ref="button">{{$t("message.select")}}</button>
      <input ref="fileinput" type="file" name="afile"/>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";

@Component
export default class InputFile extends Vue {
  mounted() {
    let fileinput = this.$refs.fileinput as HTMLInputElement;
    let button = this.$refs.button as HTMLButtonElement;
    fileinput.onchange = e => {
      if (!fileinput.files || fileinput.files.length === 0)
        button.textContent = this.$t("message.select").toString();
      else
        button.textContent = fileinput.files[0].name;
      this.$emit('change', fileinput);
    };

    fileinput.ondragenter = e => {
      button.textContent = this.$t("message.drop").toString();
      button.classList.add("dropping");
    };

    fileinput.ondragleave = e => {
      button.textContent = this.$t("message.select").toString();
      button.classList.remove("dropping");
    };
  }
}
</script>

<style scoped>
div {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

button {
  border: 5px dotted rgba(0, 0, 0, 0.12);
  color: gray;
  background-color: rgba(0, 0, 0, 0.06);
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
}

button.dropping {
  background-color: rgba(0, 0, 0, 0);
}

input[type="file"]:hover {
  cursor: pointer;
}

button:hover {
  cursor: pointer;
}

input[type="file"] {
  position: absolute;
  top: 0px;
  left: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
}
</style>
