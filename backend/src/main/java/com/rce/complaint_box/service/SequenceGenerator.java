package com.rce.complaint_box.service;

import static org.springframework.data.mongodb.core.FindAndModifyOptions.options;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.rce.complaint_box.model.DatabaseSequence;

@Service
public class SequenceGenerator {

    @Autowired
    private MongoOperations mongoOperations;

    public long incrementSequence(String sequenceName) {
        DatabaseSequence counter = mongoOperations.findAndModify(
                Query.query(Criteria.where("_id").is(sequenceName)),
                new Update().inc("seq", 1),
                options().returnNew(true).upsert(true),
                DatabaseSequence.class);

        return counter != null ? counter.getSeq() : 1;
    }

    public long decrementSequence(String sequenceName) {
        long current = peekSequence(sequenceName);
        if (current <= 0) {
            return 0;
        }

        DatabaseSequence counter = mongoOperations.findAndModify(
                Query.query(Criteria.where("_id").is(sequenceName)),
                new Update().inc("seq", -1),
                options().returnNew(true).upsert(true),
                DatabaseSequence.class);

        return counter != null ? counter.getSeq() : 0;
    }

    public long peekSequence(String sequenceName) {
        DatabaseSequence counter = mongoOperations.findOne(
                Query.query(Criteria.where("_id").is(sequenceName)),
                DatabaseSequence.class);

        return counter != null ? counter.getSeq() : 0;
    }

    public void setSequence(String sequenceName, long value) {
        mongoOperations.findAndModify(
                Query.query(Criteria.where("_id").is(sequenceName)),
                new Update().set("seq", value),
                options().upsert(true),
                DatabaseSequence.class);
    }
}
