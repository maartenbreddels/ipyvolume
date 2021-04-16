/*
 *  Copyright 2017 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *import static org.assertj.core.api.Assertions.assertThat;
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package ipyvolume.serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import ipyvolume.VolumeData;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class VolumeDataSerializer extends JsonSerializer<VolumeData>{
    @Override
    public void serialize(VolumeData value, JsonGenerator jgen, SerializerProvider provider)
            throws IOException, JsonProcessingException {

        synchronized (value) {
            jgen.writeStartObject();
            jgen.writeObjectField("image_shape", value.getImageShape());
            jgen.writeObjectField("slice_shape", value.getSliceShape());
            jgen.writeObjectField("rows", value.getRows());
            jgen.writeObjectField("columns", value.getColumns());
            jgen.writeObjectField("slices", value.getSlices());
            jgen.writeObjectField("src", dataToPng(value));
            jgen.writeEndObject();
        }
    }

    private String dataToPng(VolumeData volumeData) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        BufferedImage bi = new BufferedImage(
                volumeData.getImageShape().get(0),
                volumeData.getImageShape().get(1),
                BufferedImage.TYPE_4BYTE_ABGR);
        Graphics gc = bi.getGraphics();
        int yOffset = volumeData.getImageShape().get(1) - (volumeData.getRows() * volumeData.getSliceShape().get(1));
        for (int slice = 0; slice < volumeData.getSlices(); slice++) {
            int sliceRow = volumeData.getRows() - 1 - slice / volumeData.getColumns();
            int sliceCol = slice % volumeData.getColumns();
            int sliceXStart = sliceCol * volumeData.getSliceShape().get(0);
            int sliceYStart = sliceRow * volumeData.getSliceShape().get(1);
            for (int x = 0; x < volumeData.getSliceShape().get(0); x++) {
                for (int y = 0; y < volumeData.getSliceShape().get(1); y++) {
                    gc.setColor(new java.awt.Color(0, 0, 0, (int) (255 *  volumeData.getTiles()[slice][x][y])));
                    gc.fillRect(sliceXStart + x, sliceYStart + y + yOffset, 1, 1);
                }
            }
        }
        ImageIO.write(bi, "png", baos);
        return "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(baos.toByteArray());
    }
}
