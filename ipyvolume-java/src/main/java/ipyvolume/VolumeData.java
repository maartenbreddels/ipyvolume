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
import ipyvolume.serializers.VolumeDataSerializer;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class VolumeData {

    private static int MIN_TEXTURE_WIDTH = 256;
    private static int MAX_TEXTURE_WIDTH = 2048 * 8;

    private static ObjectMapper mapper;
    static {
        SimpleModule module = new SimpleModule("SimpleModule", new Version(1,0,0, null));
        module.addSerializer(VolumeData.class, new VolumeDataSerializer());
        mapper = new ObjectMapper();
        mapper.registerModule(module);
    }

    private List<Integer> imageShape;
    private List<Integer> sliceShape;
    private int rows;
    private int columns;
    private int slices;
    private float[][][] tiles;

    public VolumeData(float[][][] data) {
        this.slices = data.length;
        int approxRows = (int) Math.round(Math.sqrt(this.slices));
        int imgWidth = Math.max(MIN_TEXTURE_WIDTH, Math.min(MAX_TEXTURE_WIDTH, getNextPowOf2(approxRows * data[0].length)));
        this.columns = imgWidth/ data[0][0].length;
        this.rows = (int) Math.ceil(this.slices/ (float) this.columns);
        int imgHeight = Math.max(MIN_TEXTURE_WIDTH, getNextPowOf2(this.rows * data[0].length));
        this.imageShape = Arrays.asList(imgWidth, imgHeight);
        this.sliceShape = Arrays.asList(data.length, data.length);
        this.tiles = data;
    }

    private int getNextPowOf2(int value) {
        return (int) Math.pow(2, 32 - Integer.numberOfLeadingZeros(value - 1));
    }

    public List<Integer> getImageShape() {
        return imageShape;
    }

    public void setImageShape(List<Integer> imageShape) {
        this.imageShape = imageShape;
    }

    public List<Integer> getSliceShape() {
        return sliceShape;
    }

    public void setSliceShape(List<Integer> sliceShape) {
        this.sliceShape = sliceShape;
    }

    public int getRows() {
        return rows;
    }

    public void setRows(int rows) {
        this.rows = rows;
    }

    public int getColumns() {
        return columns;
    }

    public void setColumns(int columns) {
        this.columns = columns;
    }

    public int getSlices() {
        return slices;
    }

    public void setSlices(int slices) {
        this.slices = slices;
    }

    public float[][][] getTiles() {
        return tiles;
    }

    public void setTiles(float[][][] tiles) {
        this.tiles = tiles;
    }

    public Object serializeToJson() {
        return mapper.convertValue(this, Map.class);
    }
}
