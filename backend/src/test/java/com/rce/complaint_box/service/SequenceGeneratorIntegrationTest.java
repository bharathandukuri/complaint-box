package com.rce.complaint_box.service;

import com.rce.complaint_box.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

class SequenceGeneratorIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private SequenceGenerator sequenceGenerator;

    @Test
    @DisplayName("SequenceGenerator increments sequence sequentially in MongoDB")
    void incrementSequence_GeneratesSequentialIds() {
        String seqName = "test_seq_inc";

        long first = sequenceGenerator.incrementSequence(seqName);
        long second = sequenceGenerator.incrementSequence(seqName);
        long third = sequenceGenerator.incrementSequence(seqName);

        assertThat(second).isEqualTo(first + 1);
        assertThat(third).isEqualTo(second + 1);
    }

    @Test
    @DisplayName("SequenceGenerator decrements sequence but does not drop below 0")
    void decrementSequence_DoesNotGoBelowZero() {
        String seqName = "test_seq_dec";

        sequenceGenerator.setSequence(seqName, 2);
        long afterDec1 = sequenceGenerator.decrementSequence(seqName);
        long afterDec2 = sequenceGenerator.decrementSequence(seqName);
        long afterDec3 = sequenceGenerator.decrementSequence(seqName);

        assertThat(afterDec1).isEqualTo(1);
        assertThat(afterDec2).isEqualTo(0);
        assertThat(afterDec3).isEqualTo(0);
    }

    @Test
    @DisplayName("SequenceGenerator peekSequence reads current value without modifying it")
    void peekSequence_ReadsWithoutModifying() {
        String seqName = "test_seq_peek";

        sequenceGenerator.setSequence(seqName, 42);

        long peek1 = sequenceGenerator.peekSequence(seqName);
        long peek2 = sequenceGenerator.peekSequence(seqName);

        assertThat(peek1).isEqualTo(42);
        assertThat(peek2).isEqualTo(42);
    }
}
