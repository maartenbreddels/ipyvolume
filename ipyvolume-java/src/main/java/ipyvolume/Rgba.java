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

package ipyvolume;

import com.fasterxml.jackson.core.Version;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import ipyvolume.serializers.RgbaSerializer;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_ENUMS_USING_TO_STRING;

public class Rgba {

    private static ObjectMapper mapper;
    static {
        SimpleModule module = new SimpleModule("SimpleModule",
                new Version(1,0,0, null));
        module.addSerializer(Rgba.class, new RgbaSerializer());
        mapper = new ObjectMapper();
        mapper.registerModule(module);
    }

    private float[] data = new float[1024];
    private int offset = 0;
    private List<Integer> shape = Arrays.asList(256, 4);
    private List<Integer> stride = Arrays.asList(4, 1);

    public float[] getData() {
        return data;
    }

    public void setData(float[] data) {
        this.data = data;
    }


    public int getOffset() {
        return offset;
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

    public List<Integer> getShape() {
        return shape;
    }

    public void setShape(List<Integer> shape) {
        this.shape = shape;
    }

    public List<Integer> getStride() {
        return stride;
    }

    public void setStride(List<Integer> stride) {
        this.stride = stride;
    }
    public Object serializeToJson() {
        return mapper.convertValue(this, Map.class);
    }
}
